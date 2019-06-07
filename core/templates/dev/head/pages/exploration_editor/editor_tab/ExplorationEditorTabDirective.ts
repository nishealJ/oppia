// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Controller for the Editor tab in the exploration editor page.
 */

require('pages/exploration_editor/editor_tab/ExplorationGraphDirective.ts');
require('pages/exploration_editor/editor_tab/StateNameEditorDirective.ts');
require(
  'pages/exploration_editor/editor_tab/StateParamChangesEditorDirective.ts');
require(
  'pages/exploration_editor/editor_tab/UnresolvedAnswersOverviewDirective.ts');
require('pages/state_editor/StateEditorDirective.ts');

require('domain/utilities/UrlInterpolationService.ts');
require('pages/exploration_editor/ExplorationCorrectnessFeedbackService.ts');
require('pages/exploration_editor/ExplorationInitStateNameService.ts');
require('pages/exploration_editor/ExplorationStatesService.ts');
require('pages/exploration_editor/ExplorationWarningsService.ts');
require('pages/exploration_editor/GraphDataService.ts');
require('pages/exploration_editor/RouterService.ts');
require('pages/state_editor/state_properties/StateEditorService.ts');
require('services/AlertsService.ts');
require('services/ContextService.ts');
require('services/ExplorationFeaturesService.ts');

oppia.directive('explorationEditorTab', ['UrlInterpolationService', function(
    UrlInterpolationService) {
  return {
    restrict: 'E',
    scope: {},
    bindToController: {},
    templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
      '/pages/exploration_editor/editor_tab/' +
      'exploration_editor_tab_directive.html'),
    controllerAs: '$ctrl',
    controller: [
      '$rootScope', '$scope', '$uibModal', 'AlertsService', 'ContextService',
      'ExplorationCorrectnessFeedbackService', 'ExplorationFeaturesService',
      'ExplorationInitStateNameService', 'ExplorationStatesService',
      'ExplorationWarningsService', 'GraphDataService', 'RouterService',
      'StateEditorService', 'UrlInterpolationService',
      function(
          $rootScope, $scope, $uibModal, AlertsService, ContextService,
          ExplorationCorrectnessFeedbackService, ExplorationFeaturesService,
          ExplorationInitStateNameService, ExplorationStatesService,
          ExplorationWarningsService, GraphDataService, RouterService,
          StateEditorService, UrlInterpolationService) {
        var ctrl = this;
        ctrl.areParametersEnabled =
          ExplorationFeaturesService.areParametersEnabled;

        ctrl.interactionIsShown = false;

        $scope.$on('refreshStateEditor', function() {
          ctrl.initStateEditor();
        });

        $scope.$watch(ExplorationStatesService.getStates, function() {
          if (ExplorationStatesService.getStates()) {
            StateEditorService.setStateNames(
              ExplorationStatesService.getStateNames());
          }
        }, true);

        ctrl.getStateContentPlaceholder = function() {
          if (
            StateEditorService.getActiveStateName() ===
            ExplorationInitStateNameService.savedMemento) {
            return (
              'This is the first card of your exploration. Use this space to ' +
              'introduce your topic and engage the learner, then ask them a ' +
              'question.');
          } else {
            return (
              'You can speak to the learner here, then ask them a question.');
          }
        };

        ctrl.addState = function(newStateName) {
          ExplorationStatesService.addState(newStateName, null);
        };

        ctrl.refreshWarnings = function() {
          ExplorationWarningsService.updateWarnings();
        };

        ctrl.initStateEditor = function() {
          ctrl.stateName = StateEditorService.getActiveStateName();
          StateEditorService.setStateNames(
            ExplorationStatesService.getStateNames());
          StateEditorService.setCorrectnessFeedbackEnabled(
            ExplorationCorrectnessFeedbackService.isEnabled());
          StateEditorService.setInQuestionMode(false);
          var stateData = ExplorationStatesService.getState(ctrl.stateName);
          if (ctrl.stateName && stateData) {
            $rootScope.$broadcast('stateEditorInitialized', stateData);

            var content = ExplorationStatesService.getStateContentMemento(
              ctrl.stateName);
            if (content.getHtml() || stateData.interaction.id) {
              ctrl.interactionIsShown = true;
            }

            $rootScope.loadingMessage = '';
          }
        };

        ctrl.recomputeGraph = function() {
          GraphDataService.recompute();
        };

        ctrl.saveStateContent = function(displayedValue) {
          ExplorationStatesService.saveStateContent(
            ctrl.stateName, angular.copy(displayedValue));
          // Show the interaction when the text content is saved, even if no
          // content is entered.
          ctrl.interactionIsShown = true;
        };

        ctrl.saveInteractionId = function(displayedValue) {
          ExplorationStatesService.saveInteractionId(
            ctrl.stateName, angular.copy(displayedValue));
          StateEditorService.setInteractionId(angular.copy(displayedValue));
        };

        ctrl.saveInteractionAnswerGroups = function(newAnswerGroups) {
          ExplorationStatesService.saveInteractionAnswerGroups(
            ctrl.stateName, angular.copy(newAnswerGroups));

          StateEditorService.setInteractionAnswerGroups(
            angular.copy(newAnswerGroups));
          ctrl.recomputeGraph();
        };

        ctrl.saveInteractionDefaultOutcome = function(newOutcome) {
          ExplorationStatesService.saveInteractionDefaultOutcome(
            ctrl.stateName, angular.copy(newOutcome));

          StateEditorService.setInteractionDefaultOutcome(
            angular.copy(newOutcome));
          ctrl.recomputeGraph();
        };

        ctrl.saveInteractionCustomizationArgs = function(displayedValue) {
          ExplorationStatesService.saveInteractionCustomizationArgs(
            ctrl.stateName, angular.copy(displayedValue));

          StateEditorService.setInteractionCustomizationArgs(
            angular.copy(displayedValue));
        };

        ctrl.saveSolution = function(displayedValue) {
          ExplorationStatesService.saveSolution(
            ctrl.stateName, angular.copy(displayedValue));

          StateEditorService.setInteractionSolution(
            angular.copy(displayedValue));
        };

        ctrl.saveHints = function(displayedValue) {
          ExplorationStatesService.saveHints(
            ctrl.stateName, angular.copy(displayedValue));

          StateEditorService.setInteractionHints(
            angular.copy(displayedValue));
        };

        ctrl.showMarkAllAudioAsNeedingUpdateModalIfRequired = function(
            contentId) {
          var stateName = StateEditorService.getActiveStateName();
          var state = ExplorationStatesService.getState(stateName);
          var recordedVoiceovers = state.recordedVoiceovers;
          var writtenTranslations = state.writtenTranslations;
          if (recordedVoiceovers.hasUnflaggedVoiceovers(contentId) ||
              writtenTranslations.hasUnflaggedWrittenTranslations(contentId)) {
            $uibModal.open({
              templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                '/components/forms/mark_all_audio_and_translations_as_' +
                'needing_update_modal_directive.html'),
              backdrop: true,
              controller: 'MarkAllAudioAndTranslationsAsNeedingUpdateController'
            }).result.then(function() {
              if (recordedVoiceovers.hasUnflaggedVoiceovers(contentId)) {
                recordedVoiceovers.markAllVoiceoversAsNeedingUpdate(contentId);
                ExplorationStatesService.saveRecordedVoiceovers(
                  stateName, recordedVoiceovers);
              }
              if (writtenTranslations.hasUnflaggedWrittenTranslations(
                contentId)) {
                writtenTranslations.markAllTranslationsAsNeedingUpdate(
                  contentId);
                ExplorationStatesService.saveWrittenTranslations(
                  stateName, writtenTranslations);
              }
            });
          }
        };

        ctrl.navigateToState = function(stateName) {
          RouterService.navigateToMainTab(stateName);
        };
      }
    ]
  };
}]);
