// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Container from "$cauth/Container";
import ScreenWithoutAuthContainer from "./ScreenWithoutAuthContainer";
import ProfilAvatar from "$elayouts/ProfilAvatar";
import {defaultObj,defaultBool} from "$cutils";
import View from "$components/View";
import theme from "$theme";

export default function MainScreenComponent({profilAvatarProps,withDrawer,allowDrawer,profilAvatarContainerProps,withProfilAvatarOnAppBar:cWithPorilAvatarOnAppbar,authProps,authRequired,...props}){
    authProps = Object.assign({},authProps),
    profilAvatarContainerProps = defaultObj(profilAvatarContainerProps);
    profilAvatarProps = defaultObj(profilAvatarProps);
    authRequired = defaultBool(authProps.required,authRequired,false);
    withDrawer = typeof withDrawer =='boolean'? withDrawer : authRequired;
    if(allowDrawer === false){
       withDrawer = false;
    }
    const withProfilAvatarOnAppBar = cWithPorilAvatarOnAppbar !== false && withDrawer && !theme.showProfilAvatarOnDrawer ? true : false;
    if(authRequired === false){
      props.withFab = false;
    }
    return <Container authProps={authProps} required={authRequired}>
        <ScreenWithoutAuthContainer
          {...props}
          withDrawer={withDrawer}
          allowDrawer={allowDrawer}
          authRequired = {authRequired}
          right = {withProfilAvatarOnAppBar && <View testID={testID+"_ProfilAvatar_Container"}  {...profilAvatarContainerProps} style={[profilAvatarContainerProps.style,styles.profilAvatarContainer]} >
            {<ProfilAvatar withLabel={false}  {...profilAvatarProps}/>}
         </View> || null}
      />
    </Container>
}