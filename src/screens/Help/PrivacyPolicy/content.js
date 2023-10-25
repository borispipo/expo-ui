// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {useAppGetComponent} from "$econtext/hooks";
import Label from "$ecomponents/Label";
import React from "$react";

export default function ContentPrivacy (){
    const PrivacyPolicy = useAppGetComponent("PrivacyPolicy"); 
    return React.isComponent(PrivacyPolicy) ? <PrivacyPolicy/>
    : React.isValidElement(PrivacyPolicy) ? PrivacyPolicy : 
    <Label primary style={{fontSize:15,fontWeight:'bold',padding:10}}>
        Pour modifier le contenu de la politique de confidentialité, il suffit de déclarer dans la propriété "components" 
        du provider "ExpoUIProvider", initialisant l'application, un attribut "PrivacyPolicy|privacyPolicy", pointant vers le composant/l'élément react, dont le contenu , une fois rendu devra remplacer celui ci (le décrivant);
    </Label>
}