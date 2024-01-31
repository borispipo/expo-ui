// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {handleError} from './helpers';
import {stringify,isJSON,parseJSON} from "$cutils/json";
import {sanitizeFileName} from "$cutils";
import isPromise from "$cutils/isPromise";
import { sanitizeKey } from '../../../../common/src/session/utils';
import * as FileSystem from 'expo-file-system';

export class Storage {
  data = new Map();
  currentPromise = null;
  getPath(){
      const appName = require("$packageJSON").name;
      return `${FileSystem.documentDirectory}${appName?`${sanitizeFileName(appName).toLowerCase().trim()}.session`:"session"}`;
  }
  init() {
    if(isPromise(this.currentPromise)) return this.currentPromise;
    this.currentPromise = FileSystem.readAsStringAsync(`${this.getPath()}`).then((its)=>{
      if(isJSON(its)){
        this.data = new Map(parseJSON(its));
      }
      return this.data;
    }).catch(e=>{});
    return this.currentPromise;
  }
  get(key) {
    return this.data.get(sanitizeKey(key));
  }
  persist(){
    return FileSystem.writeAsStringAsync(this.getPath(), stringify(Array.from(this.data.entries())));
  }
  set(key, value) {
    key = sanitizeKey(key);
    if (!key) return handleError('set', 'a key');
    this.data.set(key, value);
    return this.persist();
  }
  remove(key) {
    key = sanitizeKey(key);
    if (!key) return handleError('remove', 'a key');
    this.data.delete(key);
    return this.persist();
  }
  getAllKeysSync(){
    return Array.from(this.data.keys());
  }
  getItem(key){
    return FileSystem.readAsStringAsync(`${this.getPath()}${key}`);
  }
}


const storage = new Storage();

storage.init();

export default storage;
