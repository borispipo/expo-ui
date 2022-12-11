// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Container from "$cauth/Container";
import ScreenWithOrWithoutAuthContainer from "./ScreenWithOrWithoutAuthContainer";
import ProfilAvatar from "$elayouts/ProfilAvatar";

export default function MainScreenComponent(props){
    return <ScreenWithOrWithoutAuthContainer
      {...props}
      renderProfilAvatar = {(props)=>{
          return <ProfilAvatar withLabel = {false}  {...props} />
      }}
      renderChildren = {({containerProps,children})=>{
          return <Container {...containerProps}>
            {children}
          </Container>
      }}
    />
}