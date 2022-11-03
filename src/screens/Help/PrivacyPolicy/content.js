// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Label from "$components/Label";

export default function ContentPrivacy (){
    return <Label primary style={{fontSize:15,fontWeight:'bold',padding:10}}>
    Pour modifier le contenu de la police de sécurité, il suffit de déclarer dans les alias, l'alias 
    $PrivacyPolicy prointant vers un fichier javascript dans lequel on exporte par défaut, soit un composant React
    où encore un élément react valide dont le rendu remplacera ledit contenu.
</Label>
}