// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import AuthSignInScreen from "./SignIn";
import UserProfileScreen from "./Profile";
//import PermProfiles from "./PermProfiles";
export default [AuthSignInScreen,UserProfileScreen,
    //PermProfiles
];

//export {PermProfiles};

export {default as PermLines} from "./PermLines";
export {default as PermLine} from "./PermLine";
export {default as PermText} from "./PermText";
//export {default as PermProfile} from "./PermProfile";