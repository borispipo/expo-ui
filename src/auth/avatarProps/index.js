// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {isNativeMobile} from "$platform";
import defaultSrc from "./defaultAvatar";
export default {
    accordion:false,
    editable : !isNativeMobile(),
    text : 'Avatar',
    type : 'image',
    defaultSrc,
    size : 100,
    sortable : false,
    datagrid : {
        size : 50,
    },
    rounded : true,
    cropProps : {
        width : 100,
        heigh : 100
    },
}