// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import TextField from "$ecomponents/TextField";
import appConfig from "$capp/config";
import {isNonNullString,defaultStr} from "$cutils";
import {formatDescription} from "$clib/currency";
import Icon from "$ecomponents/Icon";
import {styles} from "$theme";

const CurrencyFormat = React.forwardRef(({disabled,readOnly,right,isFilter,...props},ref)=>{
    const isEditable = disabled !== true && readOnly !== true;
    const defaultValue = isNonNullString(props.defaultValue) && props.defaultValue.contains("v" && props.defaultValue) && props.defaultValue || defaultStr(appConfig.currencyFormat,"%v %s");
    const title = formatDescription;
    return <TextField      
        affix = {false}
        enableCopy = {false}
        {...props}
        disabled = {disabled}
        readOnly = {readOnly || !isEditable}
        defaultValue = {defaultValue}
        right = {!isEditable || isFilter ? right : (rP)=>{
            const r = typeof right =='function'? right(rP) : right;
            return <>
                  <Icon
                        {...rP}
                        size = {25}
                        style = {[styles.ml0,styles.mr0]}
                        name = "alpha-f-box"
                        title={title}
                  />
                 {React.isValidElement(r) && r || null}
            </>
        }}
        ref = {ref}
        title={title}
    />  
});

CurrencyFormat.displayName = "CurrencyFormatComponent";

export default CurrencyFormat;

CurrencyFormat.propTypes = {
    ...TextField.propTypes
}