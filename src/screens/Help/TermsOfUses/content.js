// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Label from "$ecomponents/Label";
import {useAppGetComponent} from "$econtext/hooks";
import React from "$react";

export default function ContentTermsOfUses (){
    const TermsOfUses = useAppGetComponent("TermsOfUses"); 
    return React.isComponent(TermsOfUses) ? <TermsOfUses/>
    : React.isValidElement(TermsOfUses) ? TermsOfUses : 
    <Label primary style={{fontSize:15,fontWeight:'bold',padding:10}}>
        Pour modifier le contenu des Termes et contrat d'utilisation, il suffit de déclarer dans la propriété "components" 
        du provider "ExpoUIProvider", initialisant l'application, un attribut "TermsOfUses|termsOfUses", pointant vers le composant/l'élément react, dont le contenu, une fois rendu devra remplacer celui ci (le décrivant);
    </Label>
}