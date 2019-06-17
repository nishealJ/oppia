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
 * @fileoverview Directive for parameter name editor.
 */

// NOTE TO DEVELOPERS: This editor requires ExplorationParamSpecsService to be
// available in the context in which it is used.

oppia.directive('parameterNameEditor', [
  'UrlInterpolationService', 'OBJECT_EDITOR_URL_PREFIX',
  function(UrlInterpolationService, OBJECT_EDITOR_URL_PREFIX) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        value: '='
      },
      templateUrl: UrlInterpolationService.getExtensionResourceUrl(
        '/objects/templates/parameter_name_editor_directive.html'),
      controllerAs: '$ctrl',
      controller: [
        '$scope', '$attrs', 'ExplorationParamSpecsService',
        function($scope, $attrs, ExplorationParamSpecsService) {
          var ctrl = this;
          ctrl.availableParamNames =
            ExplorationParamSpecsService.savedMemento.getParamNames();

          if (ctrl.availableParamNames.length === 0) {
            ctrl.localValue = null;
          } else {
            ctrl.localValue = ctrl.availableParamNames[0];
          }

          ctrl.validate = function() {
            return (ctrl.availableParamNames.length === 0) ? false : true;
          };

          ctrl.SCHEMA = {
            type: 'unicode',
            choices: ctrl.availableParamNames
          };

          // Reset the component each time the value changes (e.g. if this is
          // part of an editable list).
          $scope.$watch('$ctrl.value', function(newValue) {
            if (newValue) {
              ctrl.localValue = newValue;
            }
          }, true);

          $scope.$watch('$ctrl.localValue', function(newValue) {
            ctrl.value = newValue;
          });
        }
      ]
    };
  }
]);
