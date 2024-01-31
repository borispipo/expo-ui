// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*** for usage, @see : https://github.com/raphaelpor/sync-storage 
  @see : https://github.com/echowaves/expo-storage
*/
import { MMKV } from 'react-native-mmkv'
import {handleError} from './helpers';
import {stringify} from "$cutils/json";
import { sanitizeKey } from '../../../../common/src/session/utils';

export const storage = new MMKV();

export const get = (key)=> {
  return storage.get(sanitizeKey(key));
}

export const set = (key, value)=> {
  key = sanitizeKey(key);
  if (!key) return handleError('set', `a key`);
  storage.set(key, value);
  value = stringify(value);
  return storage.set(key, value).then((v)=>{return {[key]:value}});
}

export const remove = (key)=> {
  key = sanitizeKey(key);
  if (!key) return handleError('remove', 'a key');
  return storage.delete(key);
}
export const clearAll = storage.clearAll;
export const removeAll = storage.clearAll;

export {MMKV};

export default {...storage,set,get,remove,clearAll,removeAll};