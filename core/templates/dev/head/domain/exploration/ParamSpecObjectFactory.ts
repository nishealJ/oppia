// Copyright 2017 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Factory for creating new frontend instances of ParamSpec
 * domain objects.
 */

import { Injectable } from '@angular/core';
import { downgradeInjectable } from '@angular/upgrade/static';

import { ParamType, ParamTypeObjectFactory } from
  'domain/exploration/ParamTypeObjectFactory.ts';

export class ParamSpec {
  _objType: ParamType;
  /**
   * @constructor
   * @param {!ParamType} objType - The type of the parameter.
   */
  constructor(objType: ParamType) {
    /** @member {ParamType} */
    this._objType = objType;
  }

  /** @returns {ParamType} - The type name of the parameter. */
  getType(): ParamType {
    return this._objType;
  }

  // TODO(#7176): Replace 'any' with the exact type. This has been kept as
  // 'any' because the return type is a dict with underscore_cased
  // keys which give tslint errors against underscore_casing in favor of
  // camelCasing.
  /** @returns {{obj_type: String}} - Basic dict for backend consumption. */
  toBackendDict(): any {
    return {
      obj_type: this._objType.getName(),
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ParamSpecObjectFactory {
  constructor(private paramTypeObjectFactory: ParamTypeObjectFactory) {}
  /**
   * @param {!{obj_type: String}} paramSpecBackendDict - Basic dict from
   *    backend.
   * @returns {ParamSpec} - A new ParamSpec instance.
   */
  // TODO(#7176): Replace 'any' with the exact type. This has been kept as
  // 'any' because 'paramSpecBackendDict' is a dict with underscore_cased
  // keys which give tslint errors against underscore_casing in favor of
  // camelCasing.
  createFromBackendDict(paramSpecBackendDict: any): ParamSpec {
    return new ParamSpec(
      this.paramTypeObjectFactory.getTypeFromBackendName(
        paramSpecBackendDict.obj_type));
  }

  /** @returns {ParamSpec} - A default instance for ParamSpec. */
  createDefault(): ParamSpec {
    return new ParamSpec(this.paramTypeObjectFactory.getDefaultType());
  }
}

angular.module('oppia').factory(
  'ParamSpecObjectFactory', downgradeInjectable(ParamSpecObjectFactory));
