// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {isNonNullString,isArray,isObjOrArray,defaultStr,defaultArray,defaultObj,isObj} from "$utils";
import Hashtag from "$ecomponents/Hashtag";
import DateLib from "$date";
import Image from "$ecomponents/Image";
import React from "$react";
import Label from "$ecomponents/Label";
import TableLink from "$TableLink";
import {Flag} from "$ecomponents/Countries";
import { StyleSheet } from "react-native";

export const renderRowCell = (arg)=>{
    let {rowData,getRowKey,context,formatValue:customFormatValue,renderRowCell:customRenderRowCell,abreviateValues,isSectionListHeader,rowIndex,index,rowCounterIndex,columnDef,columnField} = arg;
    context = context || this;
    const canFormatValue = customFormatValue !== false ? true : false;
    const renderText = isSectionListHeader === true || customRenderRowCell === false ? true : false;
    rowIndex = isDecimal(rowIndex)? rowIndex : isDecimal(index)? index : undefined;
    rowCounterIndex = isDecimal(rowCounterIndex) ? rowCounterIndex : isDecimal(rowIndex)? rowIndex+1 : defaultDecimal(rowCounterIndex);
    if(!isObj(rowData)) return renderText ? null : {render:null,extra:{}};
    let _render = null;
    getRowKey = typeof getRowKey =='function'? getRowKey : React.getKey;
    columnDef = defaultObj(columnDef);
    let _type = defaultStr(columnDef.jsType,columnDef.type).trim().toLowerCase().replaceAll("_","");
    let renderProps = undefined;
    if(isObj(columnDef.datagrid)){
        renderProps = columnDef.datagrid.renderProps;
    }
    const style = Object.assign({},StyleSheet.flatten(columnDef.style));
    if(!renderText && columnDef.visible === false){
        style.display = "none";
    }
    const extra = {style},renderArgs = arg;
    renderArgs.extra = extra;
    renderArgs.item = rowData;
    const defaultValue = renderArgs.defaultValue = renderArgs.value = rowData[columnField];
    let key = getRowKey.call(context,rowData,rowIndex)+"-"+columnField;
    if(isObj(columnDef.datagrid) && isFunction(columnDef.datagrid.render)){
        _render = columnDef.datagrid.render.call(context,renderArgs);
    } else if(isFunction(columnDef.multiplicater)){
        _render = defaultDecimal(columnDef.multiplicater({...renderArgs,value:rowData[columnField]}),rowData[columnField]);
    } else {
        _render = defaultValue;
        if(!renderText && defaultStr(columnDef.format).toLowerCase() === 'hashtag'){
        _render = <Hashtag>{_render}</Hashtag>
        } else if(typeof columnDef.render === "function"){
            _render = columnDef.render.call(context,renderArgs);
        } else if(arrayValueExists( _type,["date","datetime","time"])){
            let _dd =DateLib.parse(rowData[columnField],_type === 'time'?DateLib.isoTimeFormat:DateLib.SQLDateFormat);
            if(DateLib.isDateObj(_dd)){
                _render = DateLib.format(_dd,defaultStr(columnDef.format,(_type === 'time'?DateLib.defaultTimeFormat:DateLib.masks.defaultDate)));
            }
            if(!_render) _render = rowData[columnField]
        } else if(arrayValueExists(_type,['switch','checkbox'])){
            let {checkedLabel,checkedValue,uncheckedLabel,uncheckedValue} = columnDef;
            checkedLabel = defaultStr(checkedLabel,'Oui')
            uncheckedLabel = defaultStr(uncheckedLabel,'Non')
            checkedValue = defaultVal(checkedValue,1); uncheckedValue = defaultVal(uncheckedValue,0)
            let val = defaultVal(rowData[columnField],columnDef.defaultValue,columnDef.value)
            if(val === checkedValue){
                _render = checkedLabel;
            } else _render = uncheckedLabel;
        }
        else if(!renderText && (_type =='selectcountry')){
            _render = <Flag withCode {...columnDef} length={undefined} width={undefined} height={undefined} code={defaultValue}/>
        }
        ///le lien vers le table data se fait via la colonne ayant la propriété foreignKeyTable de type chaine de caractère non nulle
        else if(!renderText && (isNonNullString(columnDef.foreignKeyTable) || columnDef.primaryKey === true || arrayValueExists(['id','piece'],_type))){
            const id = rowData[columnField]?.toString();
            if(isNonNullString(id)){
                _render = <TableLink 
                    id = {id}
                    foreignKeyTable = {defaultStr(columnDef.foreignKeyTable,columnDef.table,columnDef.tableName)}
                    foreignKeyColumn = {defaultStr(columnDef.foreignKeyColumn,columnDef.field)}
                    {...columnDef}
                    data = {rowData}
                    columnField = {columnField}
                >
                    {renderSelectFieldCell({columnDef,columnField,rowData})}
                </TableLink>             
            }
        } else if((_type.contains('select'))){
            _render= renderSelectFieldCell({columnDef,columnField,rowData,data:rowData})
        } else if(_type == 'image'){
            if(renderText) return null;
            columnDef = defaultObj(columnDef)
            columnDef = {...columnDef,...defaultObj(columnDef.datagrid)};
            columnDef.size = defaultDecimal(columnDef.size,50);
            columnDef.editable = defaultBool(columnDef.editable,false)
            columnDef.rounded = defaultBool(columnDef.rounded,columnDef.round,true);
            columnDef.src = rowData[columnField];
            _render = <Image {...columnDef}/>
        } 
        if(_render === undefined || _render ===null){
            _render = rowData[columnField];
        }
        if(columnDef.type =="password" && isNonNullString(_render)){
            let l = Math.max(_render.length,20);
            _render = "";
            for(let i=0;i<l;i++){
                _render+=".";
            }
        }
        if(isArray(_render)){
            _render = _render.join(arrayValueSeparator);
        }
    } 
    if(_render ===undefined){
        _render = rowData[columnField];
    }
    if(isArray(_render)){
        _render = _render.join(arrayValueSeparator);
    } else if(!React.isValidElement(_render) && isPlainObj(_render)){
        let __r = "";
        for(let i in _render){
            __r+= (isObj(_render[i]) && _render[i]? (_render[i].code? _render[i].code:defaultStr(_render[i].label)):(_render[i]))
        }
        _render = __r;
    }
    if(isFunction(renderProps)){
        renderProps = renderProps.call(context,renderArgs);
    }
    if(canFormatValue){
        _render = formatValue(_render,columnDef.format,abreviateValues);
    }
    if(!renderText && _render && isObj(renderProps)){
        let Component = defaultVal(renderProps.Component,Label);
        delete renderProps.Component;
        _render = <Component {...renderProps}>{_render}</Component>
    }
    if(renderText){
        if(typeof _render =='number' || typeof _render =='boolean' || typeof _render =="string"){
            return _render;
        }
        return React.getTextContent(_render);
    }
    if((typeof _render ==='string' || typeof _render =='number')){
        _render = <Label selectable>{_render}</Label>
    }
    _render = React.isValidElement(_render)|| Array.isArray(_render)?_render:null;
    return {render:_render,style,extra,key};
}

export const  renderSelectFieldCell= ({rowData,columnDef,columnField})=>{
    let v1 = rowData[columnField],_render = v1;
    if(isObjOrArray(columnDef.items)){
            if(columnDef.multiple){
                v1 = Object.toArray(v1);
                _render = "";
                v1.map((v)=>{
                    for(let i in columnDef.items){
                        let it = columnDef.items[i];
                        if(isObj(it) && defaultVal(it.code,i) == v){
                            _render+=(_render?arrayValueSeparator:"")+defaultStr(it.label,it.text,v);
                        } else if(isNonNullString(it) && i == v){
                            _render+=(_render?arrayValueSeparator:"")+it;
                        }
                    }
                })
                if(!_render){
                    return v1.join(arrayValueSeparator);
                }
                return _render;
            } else {
                for(let i in columnDef.items){
                    let it = columnDef.items[i];
                    if(isObj(it) && defaultVal(it.code,i) == v1){
                        return defaultStr(it.label,it.text,v1);
                    } else if(isNonNullString(it) && i == v1){
                        return it;
                    }
                }
                if(_render === undefined || _render === null) return v1;
                if(isArray(_render)){
                    return _render.join(arrayValueSeparator)
                } else if(isObj(_render)){
                    return "";
                }
        }
    }
    return _render 
}

export const formatValue = (value,format,abreviateValues)=>{
    if(typeof value !='number') return value;
    if(typeof value =='boolean'){
        return value ? "Oui" : "Non";
    }
    format = typeof format =='string'? format.toLowerCase().trim() : "";
    if(format =='money'){
        return abreviateValues? value.abreviate2FormatMoney() : value.formatMoney();
    }
    return abreviateValues ? value.abreviate() : value.formatNumber();
}


export const arrayValueSeparator = ", ";