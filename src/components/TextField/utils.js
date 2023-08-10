// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/****
 *  @namespace TextField
 *  contient un ensemble d'utilitaires pour la création du composant TextField
 */
import {defaultStr,parseDecimal as NParseDecimal,defaultDecimal} from "$cutils";


export const flatMode = 'flat';
export const outlinedMode = 'outlined';
export const normalMode = "normal";
export const shadowMode = "shadow";

export const defaultMode = outlinedMode;

export const modes = {flat:flatMode,shadow:shadowMode,outlined:outlinedMode,normal:normalMode};

export const modesObject = {
    flat : {
        code : flatMode,
        label : 'Flottant',
    },
    shadow : {
        code : shadowMode,
        label : 'Ombre',
    },
    normal : {
        code : normalMode,
        label : 'Normal',
    },
    outlined : {
        code : outlinedMode,
        label : 'Décrit',
    }
}


export const HEIGHT = 56;


export const AutoCapitalizeTypes = {
    characters : "characters", ///all characters.
    words : "words", //first letter of each word.
    sentences :"sentences", //first letter of each sentence (default).
    none : "none", ///don't auto capitalize anything.
}

export const keyboardTypes = {
    default : 'default',
    number : "number-pad",
    numberPad : "number-pad",
    decimal : "decimal-pad",
    numeric : "numeric",
    email : "email-address",
    tel : "phone-pad",
    phone : "phone-pad",
}

export const inputModes = {
    default : 'none',
    number : "numberic",
    decimal : "decimal",
    numeric : "numeric",
    email : "email",
    tel : "tel",
    phone : "tel",
    search : "search",
    url : "url",
}
export const FONT_SIZE = 16;

export const parseDecimal = (v,type,preserveDecimalLength)=>{
    type = defaultStr(type).trim().toLowerCase();
    if((type =='number' || type =='decimal') && !isDecimal(v)){
        if(v == undefined || v == null){
            v = '';
        }
        v = defaultDecimal(NParseDecimal(v,preserveDecimalLength),0);
    }
    return v;
}