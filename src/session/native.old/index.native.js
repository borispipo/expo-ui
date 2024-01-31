// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { handleGetValue,handleSetValue } from './utils'
import storage from "./native";
const get = key => handleGetValue(storage.get(key))
const set = (key,value,decycle)=>{
    return Promise.resolve(storage.set(key,handleSetValue(value,decycle)));
}

export default {get,set};

export {get,set}