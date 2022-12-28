// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import TextField from "$components/TextField";
import appConfig from "$capp/config";
import {isNonNullString,defaultStr} from "$cutils";

const CurrencyFormat = React.forwardRef((props,ref)=>{
    const defaultValue = isNonNullString(props.defaultValue) && props.defaultValue.contains("v" && props.defaultValue || defaultStr(appConfig.currencyFormat,"%v %s"))
    return <TextField      
        affix = {false}
        enableCopy = {false}
        {...props}
        defaultValue = {defaultValue}
        ref = {ref}
        title="Format d'affichage des valeurs numériques : de la forme %v%s ou %v représente la valeur du montant et %s représente la devise : exemple %s%v => $10 et %s %v => 10 $"
    />  
});

CurrencyFormat.displayName = "CurrencyFormatComponent";

export default CurrencyFormat;

CurrencyFormat.propTypes = {
    ...TextField.propTypes
}