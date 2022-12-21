// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import {defaultObj,defaultStr,isNonNullString} from "$utils";
import SimpleSelect from "$ecomponents/SimpleSelect";
import TextField from "$ecomponents/TextField";
import Icon from "$ecomponents/Icon";
import {currencies} from "$ccurrency";
import { Pressable } from "react-native";
import {styles} from "$theme";
import appConfig from "$app/config";
import PropTypes from "prop-types";

const CurrencySelector = React.forwardRef((props,ref)=>{
    return <SimpleSelect ref={ref} {...selectCurrencyFieldProps(props)}/>
});

CurrencySelector.displayName = "CurrencySelector";

export default CurrencySelector;

export const currencyFormatRef = React.createRef(null);

/*** onAdd est appelé lorsqu'on ajoute un format personalisé */
export const selectCurrencyFieldProps = ({right,disabled,readOnly,onFormatChange,isFilter,onChange,onBlur,editable,...props})=>{
    const isEditable = disabled !== true && readOnly !== true && editable !== false;
    const currency = appConfig.currency;
    currencyFormatRef.current = defaultStr(currencyFormatRef.current,appConfig.currencyFormat,"%v %s");
    const iconSize = 25;
    return {
        items : currencies,
        getItemValue : ({item})=>item.code,
        renderItem : ({item}) => "["+item.code+"] " +item.name,
        showAdd : false,
        defaultValue : defaultStr(currency.code),
        enableCopy : false,
        ...props,
        isFilter,
        onChange : (args)=>{
            args.currencyFormat = args.format = defaultStr(currencyFormatRef.current)
            if(onChange){
                onChange(args);
            }
        },
        onBlur : (args)=>{
            args.currencyFormat = args.format = defaultStr(currencyFormatRef.current);
            if(onBlur){
                onBlur(args);
            }
        },
        disabled : !isEditable,
        editable : isEditable,
        right : !isEditable || isFilter ? right : (rP)=>{
            const r = typeof right =='function'? right(rP) : right;
            return <>
                <Pressable style={{width:80}}
                    onPress = {(e)=>{
                        React.stopEventPropagation(e);
                    }}
                >
                    <TextField
                        {...rP}
                        affix = {false}
                        editable = {isEditable}
                        disabled = {disabled}
                        readOnly = {readOnly}
                        enableCopy = {false}
                        contentContainerProps = {{
                            style:{height:37,paddingVertical:0,paddingHorizontal:0},
                        }}
                        mode = {'flat'}
                        left = {(p)=>{
                            return <Icon
                                {...rP}
                                {...p}
                                size = {iconSize}
                                style = {[styles.ml0,styles.mr0,{width:iconSize,height:iconSize}]}
                                icon = "alpha-f-box"
                                title="Format d'affichage des valeurs numériques : de la forme %v%s ou %v représente la valeur du montant et %s représente la devise : exemple %s%v => $10 et %s %v => 10 $"
                            />
                        }}
                        defaultValue = {currencyFormatRef.current}
                        containerProps = {{
                            width:70,
                        }}
                        onChange = {(args)=>{
                            currencyFormatRef.current = args.value;
                            if(typeof onFormatChange =="function"){
                                onFormatChange(args)
                            }
                        }}
                    />  
                </Pressable>
                {React.isValidElement(r) && r || null}
            </>
        },
        type : 'select',
    }
}

CurrencySelector.propTypes = {
    ...SimpleSelect.propTypes,
    onFormatChange : PropTypes.func,//lorsque le format de la currency change
}