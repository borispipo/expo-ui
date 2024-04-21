// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Container from "$cauth/Container";
import ScreenWithoutAuthContainer from "./ScreenWithoutAuthContainer";
import ProfilAvatar from "$elayouts/ProfilAvatar";
import {defaultObj,defaultBool} from "$cutils";
import theme from "$theme";
import React from "$react";

export default function MainScreenComponent({profilAvatarProps,appBarProps,testID,withDrawer,allowDrawer,profilAvatarContainerProps,withProfilAvatarOnAppBar:cWithPorilAvatarOnAppbar,authProps,authRequired,...props}){
    authProps = Object.assign({},authProps),
    profilAvatarContainerProps = defaultObj(profilAvatarContainerProps);
    profilAvatarProps = defaultObj(profilAvatarProps);
    authRequired = defaultBool(authProps.required,authRequired,false);
    withDrawer = typeof withDrawer =='boolean'? withDrawer : authRequired;
    if(allowDrawer === false){
       withDrawer = false;
    }
    testID = defaultStr(testID,"RN_MainScreenComponent");
    const withProfilAvatarOnAppBar = cWithPorilAvatarOnAppbar !== false && withDrawer && !theme.showProfilAvatarOnDrawer ? true : false;
    appBarProps = defaultObj(appBarProps);
    const {right} = appBarProps;
    if(withProfilAvatarOnAppBar){
      appBarProps.right = (...p)=>{
         const r = typeof right =='function'? right(p) : right;
         return <>
            <ProfilAvatar renderedOnAppBar withLabel={false} size={40}  {...profilAvatarProps}/>
            {React.isValidElement(r)? r : null}
         </>
      }
    }
    return <Container authProps={authProps} required={authRequired} testID={testID}>
        <ScreenWithoutAuthContainer
          {...props}
          withDrawer={withDrawer}
          allowDrawer={allowDrawer}
          authRequired = {authRequired}
          appBarProps={appBarProps}
      />
    </Container>
}