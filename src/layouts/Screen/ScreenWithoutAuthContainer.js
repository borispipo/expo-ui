// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*** 
 *le fait que l'utilisateur soit connecté où pas
 */

import ScreenWithOrWithoutAuthContainer from "./ScreenWithOrWithoutAuthContainer";
export default function ScreenWithoutAuthContainer(props){
    return <ScreenWithOrWithoutAuthContainer
      {...props}
      renderChildren = {({children})=>{
          return children
      }}
    />
}