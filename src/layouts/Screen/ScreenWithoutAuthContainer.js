// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*** afin d'éviter les redondances cycliques avec le module $loginComponent, ce composant doit être utiliser pour 
 * le rendu de tous les composants implémentés définis dans le fichier $loginComponent car ne necessite pas de test sur 
  le fait que l'utilisateur soit connecté où pas
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