// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*** for usage, @see : https://github.com/raphaelpor/sync-storage 
  @see : https://github.com/echowaves/expo-storage
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import isPromise from "$cutils/isPromise";
import {handleError} from './helpers';
import {stringify} from "$cutils/json";
import { sanitizeKey } from '../utils';

let currentInitSession = undefined;

export const isInitialized = x=> isPromise(currentInitSession);

class SyncAsyncStorage {
  data = new Map();
  loading = true;

  init() {
    if(isInitialized()){
      return currentInitSession;
    }
    currentInitSession = AsyncStorage.getAllKeys().then((keys) =>
      AsyncStorage.multiGet(keys).then((data) => {
        data.forEach(this.saveItem.bind(this));
        this.isInitialized = true;
        return [...this.data];
      }),
    );
    return currentInitSession;
  }

  get(key) {
    return this.data.get(sanitizeKey(key));
  }

  set(key, value) {
    key = sanitizeKey(key);
    if (!key) return handleError('set', 'a key');
    this.data.set(key, value);
    value = stringify(value);
    return AsyncStorage.setItem(key, value).then((v)=>{return {[key]:value}});
  }

  remove(key) {
    key = sanitizeKey(key);
    if (!key) return handleError('remove', 'a key');

    this.data.delete(key);
    return AsyncStorage.removeItem(key);
  }

  saveItem(item) {
    let value;

    try {
      value = JSON.parse(item[1]);
    } catch (e) {
      [, value] = item;
    }

    this.data.set(item[0], value);
    this.loading = false;
  }

  getAllKeys(){
    return Array.from(this.data.keys());
  }
}


const syncAsyncStorage = new SyncAsyncStorage();

syncAsyncStorage.init();

export default syncAsyncStorage;