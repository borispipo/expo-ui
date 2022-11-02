// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Label from "$components/Label";

export default function ContentPrivacy (){
    return <Label primary style={{fontSize:15,fontWeight:'bold',padding:10}}>
        Pour définir modifier le contenu de la police de sécurité, il suffit de déclarer dans les alias, l'alias 
        $PrivacyPolicy prointant dans un fichier javascript dans lequel vous exportez par défaut, soit un composant React
        où encore un élément react valide, qui remplacera ledit contenu
    </Label>
}