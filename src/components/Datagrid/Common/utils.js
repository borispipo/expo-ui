// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {isNonNullString,isArray,isObjOrArray,maxItemsToRender,defaultStr,defaultArray,defaultObj,isObj} from "$cutils";
import Hashtag from "$ecomponents/Hashtag";
import DateLib from "$date";
import Image from "$ecomponents/Image";
import React from "$react";
import Label from "$ecomponents/Label";
import TableLink from "$ecomponents/TableLink";
import {Flag} from "$ecomponents/Countries";
import { StyleSheet } from "react-native";
import {isDesktopMedia} from "$dimensions";
import {View} from "react-native";
import theme from "$theme";
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
            if(rowData[columnField]){
                const sqlFormat =_type === 'time'? undefined : _type ==="datetime" ? DateLib.SQLDateTimeFormat : DateLib.SQLDateFormat;
                let _dd =DateLib.parse(rowData[columnField],sqlFormat);
                if(DateLib.isDateObj(_dd)){
                    const eFormat = defaultStr(columnDef.format,(_type === 'time'?DateLib.defaultTimeFormat:_type=="datetime"? DateLib.defaultDateTimeFormat:DateLib.masks.defaultDate));
                    _render = DateLib.format(_dd,eFormat);
                }
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
            if(isNonNullString(id) || typeof id ==='number'){
                const foreignKeyTable = defaultStr(columnDef.foreignKeyTable,columnDef.table,columnDef.tableName);
                const foreignKeyColumn = defaultStr(columnDef.foreignKeyColumn,columnDef.field);
                const rProps = {
                    foreignKeyTable,
                    foreignKeyColumn,
                    ...columnDef,
                    multiple : undefined,
                    readOnly : undefined,
                    disabled : undefined,
                    data : rowData,
                    columnField,
                }
                const sepp = ",";
                if(columnDef.multiple && id.contains(sepp)){
                    let hasC = false,sep2 ="";
                    const maxItemsToRender = defaultNumber(columnDef?.datagrid?.maxItemsToRender,5);
                    let renderedItems = 0;
                    const idSplit = id.split(sepp);
                    _render = <View style={[style,theme.styles.row,theme.styles.flexWrap]} testID={"RN_RowCell_"+columnDef.field+"multiple_"}>
                        {idSplit.map((idd,index)=>{
                            if(!isNonNullString(idd) || maxItemsToRender === renderedItems) return null;
                            idd = idd.trim();
                            if(!idd) return null;
                            if(hasC){
                                sep2=", ";
                            }
                            hasC = true;
                            renderedItems++;
                            const suffix = renderedItems === maxItemsToRender && idSplit.length > maxItemsToRender ? <Label>...et {" "+idSplit.length.formatNumber()+" de plus"}</Label> : null;
                            return suffix ? <>
                                <TableLink 
                                    key = {index}
                                    {...rProps}
                                    id = {idd}
                                >
                                    {sep2+idd}
                                </TableLink>
                                {suffix}
                            </> : <TableLink 
                                    key = {index}
                                    {...rProps}
                                    id = {idd}
                                >
                                    {sep2+idd}
                                </TableLink>
                        })}
                    </View>
                    
                } else {
                    _render = <TableLink 
                        {...rProps}
                        id = {id}
                    >
                        {renderSelectFieldCell({columnDef,rowCellValue:id,columnField,rowData})}
                    </TableLink>   
                } 
            }
        } else if((_type.contains('select'))){
            _render= renderSelectFieldCell({columnDef,columnField,rowData,data:rowData})
        } else if(_type == 'image'){
            if(renderText) return null;
            columnDef = defaultObj(columnDef)
            columnDef = {...columnDef,...defaultObj(columnDef.datagrid)};
            columnDef.size = defaultDecimal(columnDef.size,50);
            columnDef.readOnly = defaultBool(columnDef.readOnly,true)
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
    if(canFormatValue){
        const formatter = typeof columnDef.formatValue =='function'? columnDef.formatValue : undefined;
        _render = formatValue(_render,columnDef.format,abreviateValues,formatter);
    }
    if(renderText){
        if(typeof _render =='number' || typeof _render =='boolean' || typeof _render =="string"){
            return _render;
        }
        return React.getTextContent(_render);
    }
    if((typeof _render ==='string' || typeof _render =='number')){
        _render = <Label userSelect>{_render}</Label>
    }
    _render = React.isValidElement(_render)|| Array.isArray(_render)?_render:null;
    return {render:_render,style,extra,key};
}

export const  renderSelectFieldCell= ({rowData,rowCellValue,columnDef,columnField})=>{
    let v1 = rowCellValue || rowData[columnField],_render = v1;
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
    if(Array.isArray(_render) || isObj(_render)){
        let rr = "",sep = "";
        Object.map(_render,(r)=>{
            const t = React.getTextContent(r);
            if(isNonNullString(t)){
                rr+=(sep)+t;
                sep = arrayValueSeparator;
            }
        })
        return rr;
    }
    return _render 
}

export const formatValue = (value,format,abreviateValues,formatter)=>{
    if(typeof value =='boolean'){
        return value ? "Oui" : "Non";
    }
    if(typeof value !='number') return value;
    format = typeof format =='string'? format.toLowerCase().trim() : "";
    if(typeof formatter =='function'){
        return formatter({value,format,abreviateValues,abreviate:abreviateValues});
    }
    if(format =='money'){
        return abreviateValues? value.abreviate2FormatMoney() : value.formatMoney();
    }
    return abreviateValues ? value.abreviate() : value.formatNumber();
}

export const getRowsPerPagesLimits = ()=>{
    return [5,10,15,20,25,30,40,50,60,80,100,500,1000,1500,2000,2500,3000,3500,4000,4500,5000,...(isDesktopMedia() ? [6000,7000,8000,9000,10000]:[])];
}


export const arrayValueSeparator = ", ";