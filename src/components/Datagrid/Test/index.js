// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Screen from "$escreen";
import SWRDatagrid from "../SWRDatagrid";
export default function TestDataScreen({...props}){
    return <SWRDatagrid {...props}/>
}

HomeScreen.screenName = "Home";