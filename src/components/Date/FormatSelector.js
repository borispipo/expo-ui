// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import DateLib from "$date";
import React,{useState} from "$react";
import {defaultObj,isNonNullString} from "$cutils";
import SimpleSelect from "$ecomponents/SimpleSelect";
import Provider from "$ecomponents/Dialog/Provider";
import TextField from "$ecomponents/TextField";
import Label from "$ecomponents/Label";
import theme from "$theme";
import notify from "$notify";
import { View } from "react-native";
import Icon from "$ecomponents/Icon";

const DateFormatSelector = React.forwardRef((props,ref)=>{
    return <SimpleSelect
        ref={ref} {...selectDateFormatFieldProps(props)}
    />
});

DateFormatSelector.displayName = "DateFormatSelector";

export default DateFormatSelector;

/*** onAdd est appelé lorsqu'on ajoute un format personalisé */
export const selectDateFormatFieldProps = ({onAdd:customOnAdd,onAddCustomFormat,inputProps,...props})=>{
    const cRight = (p)=><Icon size={20} {...p} name ="material-help" title="Utilisez les champ d : pour date, m pour mois, y pour année, H pour heure, M pour minute, s pour seconde. les jour sur 3 lettres (Lun) sont : ddd, les jours écris complètement sont dddd (Lundi); les mois en court sont définis par mmm (Juil), les mois en complet : mmmm (Juillet)."/>;
    const onAdd = ()=>{
        const labelRef = React.createRef(null);
        const valueRef = React.createRef(null);
        Provider.open(({
            title : "Ajouter un format de date personalisé",
            children : <View style={[theme.styles.w100,theme.styles.ph1]}>
                <TextField
                    type = "text"
                    label = "Format personalisé"
                    enableCopy = {false}
                    right ={cRight} 
                    onChange = {(args)=>{
                        const {value} = args;
                        if(!labelRef.current || !labelRef.current.update) return;
                        if((value)){
                            try {
                                var d = new Date().toFormat(value);
                                if(d){ 
                                    labelRef.current.update(d);
                                    valueRef.current = {...args,code:value,label:d};
                                } else {
                                    labelRef.current.update("");
                                    valueRef.current = null;
                                }
                            } catch{
                                labelRef.current.update("");
                                valueRef.current = null;
                            }
                        }
                    }}
                />
                <View style={[theme.styles.w100,theme.styles.row,theme.styles.flexWrap]}>
                    <Label>EX : </Label>
                    <Label.withRef primary textBold ref={labelRef}></Label.withRef>
                </View>
            </View>,
            actions : [{
                text : "Valider",
                icon : "check",
                onPress : ()=>{
                    if(!isObj(valueRef.current) || !isNonNullString(valueRef.current.value)){
                        return notify.error("Vous devez spécifier un format valide");
                    }
                    if(typeof customOnAdd =='function'){
                        customOnAdd(valueRef.current);
                    }
                    if(typeof onAddCustomFormat =="function"){
                        onAddCustomFormat(valueRef.current);
                    }
                    Provider.close();
                }
            }],
        }))
    };
    inputProps = defaultObj(props.inputProps);
    return {
        getItemValue : ({item})=>item.code,
        renderItem : dateFormatSelectorRenderItem,
        showAdd : true,
        label : "Format de date",
        items : getDateFormatSelectorItems(props),
        ...props,
        inputProps : {
            enableCopy:false,...inputProps,
            right : (p)=>{
                const cc = cRight(p);
                const r = typeof inputProps.right =='function'? inputProps.right(p) : inputProps.right;
                return React.isValidElement(r) ? <>{r}{cc}</> : cc;
            }
        },
        defaultValue : defaultStr(props.defaultValue,props.format),
        onAdd,
    }
}
export const getDateFormatSelectorItems = x=> Object.map(DateLib.sortedFormats,(format)=>{
    return {code : format,label:new Date().toFormat(format)}
});

export const dateFormatSelectorRenderItem = ({item})=>{
    return "{0} [{1}]".sprintf(item.label,item.code);
}

DateFormatSelector.propTypes = {
    ...SimpleSelect.propTypes,
    //appelée lorsqu'on ajoute un format personalisé
}