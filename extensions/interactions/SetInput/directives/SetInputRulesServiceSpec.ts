// Copyright 2015 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for Set Input rules.
 */

require('interactions/SetInput/directives/SetInputRulesService.ts');

describe('Set Input rules service', function() {
  beforeEach(angular.mock.module('oppia'));

  var sirs = null;
  beforeEach(angular.mock.inject(function($injector) {
    sirs = $injector.get('SetInputRulesService');
  }));

  var RULE_INPUT = {
    x: ['a', 'b']
  };

  it('should have a correct \'equals\' rule', function() {
    expect(sirs.Equals(['a', 'b'], RULE_INPUT)).toBe(true);
    expect(sirs.Equals(['b', 'a'], RULE_INPUT)).toBe(true);
    expect(sirs.Equals(['a'], RULE_INPUT)).toBe(false);
    expect(sirs.Equals(['b'], {
      x: ['b', 'a']
    })).toBe(false);
    expect(sirs.Equals(['b', 'c'], {
      x: ['c', 'd']
    })).toBe(false);
  });

  it('should have a correct \'is subset of\' rule', function() {
    expect(sirs.IsSubsetOf(['a'], RULE_INPUT)).toBe(true);
    expect(sirs.IsSubsetOf(['b'], RULE_INPUT)).toBe(true);
    expect(sirs.IsSubsetOf([], RULE_INPUT)).toBe(true);
    expect(sirs.IsSubsetOf(['a', 'b'], RULE_INPUT)).toBe(false);
    expect(sirs.IsSubsetOf(['c'], RULE_INPUT)).toBe(false);
    expect(sirs.IsSubsetOf(['a', 'b', 'c'], RULE_INPUT)).toBe(false);
  });

  it('should have a correct \'is superset of\' rule', function() {
    expect(sirs.IsSupersetOf(['a', 'b', 'c'], RULE_INPUT)).toBe(true);
    expect(sirs.IsSupersetOf(['a', 'b', 'ab'], RULE_INPUT)).toBe(true);
    expect(sirs.IsSupersetOf(['a', 'c'], RULE_INPUT)).toBe(false);
    expect(sirs.IsSupersetOf(['a', 'b'], RULE_INPUT)).toBe(false);
    expect(sirs.IsSupersetOf(['a'], RULE_INPUT)).toBe(false);
    expect(sirs.IsSupersetOf([], RULE_INPUT)).toBe(false);
  });

  it('should have a correct \'has elements in\' rule', function() {
    expect(sirs.HasElementsIn(['a', 'b', 'c'], RULE_INPUT)).toBe(true);
    expect(sirs.HasElementsIn(['a', 'b'], RULE_INPUT)).toBe(true);
    expect(sirs.HasElementsIn(['a'], RULE_INPUT)).toBe(true);
    expect(sirs.HasElementsIn(['c'], RULE_INPUT)).toBe(false);
    expect(sirs.HasElementsIn([], RULE_INPUT)).toBe(false);
  });

  it('should have a correct \'has elements not in\' rule', function() {
    expect(sirs.HasElementsNotIn(['a', 'b', 'c'], RULE_INPUT)).toBe(true);
    expect(sirs.HasElementsNotIn(['c'], RULE_INPUT)).toBe(true);
    expect(sirs.HasElementsNotIn(['a', 'b'], RULE_INPUT)).toBe(false);
    expect(sirs.HasElementsNotIn(['a'], RULE_INPUT)).toBe(false);
    expect(sirs.HasElementsNotIn([], RULE_INPUT)).toBe(false);
  });

  it('should have a correct \'omits elements in\' rule', function() {
    expect(sirs.OmitsElementsIn(['c', 'ab'], RULE_INPUT)).toBe(true);
    expect(sirs.OmitsElementsIn(['c'], RULE_INPUT)).toBe(true);
    expect(sirs.OmitsElementsIn(['a'], RULE_INPUT)).toBe(true);
    expect(sirs.OmitsElementsIn([], RULE_INPUT)).toBe(true);
    expect(sirs.OmitsElementsIn(['a', 'b', 'c'], RULE_INPUT)).toBe(false);
    expect(sirs.OmitsElementsIn(['a', 'b'], RULE_INPUT)).toBe(false);
  });

  it('should have a correct \'is disjoint\' rule', function() {
    expect(sirs.IsDisjointFrom(['c', 'ab'], RULE_INPUT)).toBe(true);
    expect(sirs.IsDisjointFrom(['c'], RULE_INPUT)).toBe(true);
    expect(sirs.IsDisjointFrom([], RULE_INPUT)).toBe(true);
    expect(sirs.IsDisjointFrom(['a', 'b', 'c'], RULE_INPUT)).toBe(false);
    expect(sirs.IsDisjointFrom(['a', 'b'], RULE_INPUT)).toBe(false);
    expect(sirs.IsDisjointFrom(['a'], RULE_INPUT)).toBe(false);
  });
});
