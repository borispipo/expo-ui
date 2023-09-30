import React from "$react";
import Divider from "$ecomponents/Divider";
import {isObj,isNonNullString,defaultStr,defaultObj} from "$cutils";
import {flattenStyle,Colors} from "$theme";
import FieldContent from "./FieldContent";

export default function FieldsContent({fields,formName,disabled,onLoopField,archived,archivable,fieldProps,primaryKeyFields,responsiveProps,isUpdate,responsive,style,data,windowWidth,...rest}){
    if(!Object.size(fields,true)) return null;
    windowWidth = typeof windowWidth ==='number' && windowWidth > 100?windowWidth : undefined;
    primaryKeyFields = isObj(primaryKeyFields) ? primaryKeyFields :  Array.isArray(primaryKeyFields) ? primaryKeyFields: [];
    const isPArray = Array.isArray(primaryKeyFields);
    const backgroundColor = flattenStyle(style)?.backgroundColor;
    return React.useMemo(()=>{
        const content = [];
        fieldProps = defaultObj(fieldProps);
        Object.map(fields,(field,index,i)=>{
            if(field === 'divider'){
                content.push(<Divider key = {index} style={theme.styles.w100}/>)
                return;
            }
            //on ignore tous les champs supposés être à ignorer
            if(!isObj(field) || field.form === false) return null;
            const name = defaultStr(field?.name,field?.field,i);
            content.push(<FieldContent
                field = {field}
                index = {index}
                onLoopField = {onLoopField}
                increment = {i}
                archivable={archivable}
                disabled = {disabled}
                archived = {archived}
                backgroundColor = {backgroundColor}
                windowWidth = {windowWidth}
                responsive = {responsive}
                responsiveProps = {responsiveProps}
                key = {defaultStr(field.name,field.field,index)|| index}
                formName = {formName}
                fields = {fields}
                primaryKey = {isPArray && primaryKeyFields.includes(name) || primaryKeyFields[name] || (name in primaryKeyFields)}
                fieldProps = {fieldProps}
                data = {data}
            />)
        });
        return content;
    },[formName,archived,backgroundColor,data,archivable,primaryKeyFields,isPArray,disabled,isUpdate,fields,responsiveProps,responsive])
}