// Copyright 2016 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Directive for the jobs tab in the admin panel.
 */

require('domain/utilities/UrlInterpolationService.ts');

oppia.directive('adminJobsTab', [
  '$http', '$timeout', 'UrlInterpolationService', 'ADMIN_HANDLER_URL',
  'ADMIN_JOB_OUTPUT_URL_TEMPLATE',
  function(
      $http, $timeout, UrlInterpolationService, ADMIN_HANDLER_URL,
      ADMIN_JOB_OUTPUT_URL_TEMPLATE) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        setStatusMessage: '='
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/admin/jobs_tab/' +
        'admin_jobs_tab_directive.html'),
      controllerAs: '$ctrl',
      controller: [function() {
        var ctrl = this;
        ctrl.HUMAN_READABLE_CURRENT_TIME = (
          GLOBALS.HUMAN_READABLE_CURRENT_TIME);
        ctrl.CONTINUOUS_COMPUTATIONS_DATA = (
          GLOBALS.CONTINUOUS_COMPUTATIONS_DATA);
        ctrl.ONE_OFF_JOB_SPECS = GLOBALS.ONE_OFF_JOB_SPECS;
        ctrl.UNFINISHED_JOB_DATA = GLOBALS.UNFINISHED_JOB_DATA;
        ctrl.RECENT_JOB_DATA = GLOBALS.RECENT_JOB_DATA;

        ctrl.showingJobOutput = false;
        ctrl.showJobOutput = function(jobId) {
          var adminJobOutputUrl = UrlInterpolationService.interpolateUrl(
            ADMIN_JOB_OUTPUT_URL_TEMPLATE, {
              jobId: jobId
            });
          $http.get(adminJobOutputUrl).then(function(response) {
            ctrl.showingJobOutput = true;
            ctrl.jobOutput = response.data.output || [];
            ctrl.jobOutput.sort();
            $timeout(function() {
              document.querySelector('#job-output').scrollIntoView();
            });
          });
        };

        ctrl.startNewJob = function(jobType) {
          ctrl.setStatusMessage('Starting new job...');

          $http.post(ADMIN_HANDLER_URL, {
            action: 'start_new_job',
            job_type: jobType
          }).then(function() {
            ctrl.setStatusMessage('Job started successfully.');
            window.location.reload();
          }, function(errorResponse) {
            ctrl.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
          });
        };

        ctrl.cancelJob = function(jobId, jobType) {
          ctrl.setStatusMessage('Cancelling job...');

          $http.post(ADMIN_HANDLER_URL, {
            action: 'cancel_job',
            job_id: jobId,
            job_type: jobType
          }).then(function() {
            ctrl.setStatusMessage('Abort signal sent to job.');
            window.location.reload();
          }, function(errorResponse) {
            ctrl.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
          });
        };

        ctrl.startComputation = function(computationType) {
          ctrl.setStatusMessage('Starting computation...');

          $http.post(ADMIN_HANDLER_URL, {
            action: 'start_computation',
            computation_type: computationType
          }).then(function() {
            ctrl.setStatusMessage('Computation started successfully.');
            window.location.reload();
          }, function(errorResponse) {
            ctrl.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
          });
        };

        ctrl.stopComputation = function(computationType) {
          ctrl.setStatusMessage('Stopping computation...');

          $http.post(ADMIN_HANDLER_URL, {
            action: 'stop_computation',
            computation_type: computationType
          }).then(function() {
            ctrl.setStatusMessage('Abort signal sent to computation.');
            window.location.reload();
          }, function(errorResponse) {
            ctrl.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
          });
        };
      }]
    };
  }
]);
