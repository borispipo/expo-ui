import React from "$react";
import PropTypes from "prop-types";
import {defaultStr,isNonNullString,defaultObj,defaultBool} from "$cutils";
import getComponentFromType from "./componentsTypes";
import appConfig from "$capp/config";
import Colors from "$theme/colors";
import { isPermAllowed } from "$eauth/utils";

const FieldContentComponent = React.forwardRef(({field,data,index,fields,formName,onLoopField,fieldProps,backgroundColor,primaryKey:customPrimaryKey,increment,fieldProp,archivable,disabled,windowWidth,responsive,responsiveProps,archived,...props},ref)=>{
    if(field?.form === false) return null;
    fieldProp = defaultObj(fieldProp);
    const name = defaultStr(field.name,field.field,index);
    const type = defaultStr(field.jsType,field.type,"text").trim().toLowerCase().replaceAll(" ","").replaceAll("-","").replaceAll("_","");
    const jsType = defaultStr(field.jsType,field.type,"text");
    const isDate = (type.contains('date') || type.contains('time'));
    let {defaultValue,renderfilter,render_filter,useDefaultValueFromData,primaryKey,hidden,renderFormDataField,getMediaQueryStyle,printLabels,queryLimit,selected,value,dataFilesInterest,perm,ignore,form,responsiveProps:customResponsiveProps,...rest} = field;
    delete rest.import;
    delete rest.export;
    const isFilter = renderfilter || render_filter || false;
    if(customPrimaryKey === true){
        primaryKey = true;
    }
    if(form === false || ignore || (!isPermAllowed(perm,{...props,field,isFormData:true,index,data,formName}))){
        return null;
    }
    if(rest.nullable === false){
        rest.required = true;
    }
    if(primaryKey === true && typeof rest.required !=='boolean'){
        rest.required = true;
    }
    if(typeof rest.filter !=='function'){
        delete rest.filter;
    }
    return React.useMemo(()=>{
        customResponsiveProps = defaultObj(customResponsiveProps);
        if(name){
            rest.defaultValue = useDefaultValueFromData === false ? defaultValue : (name in data && data[name] !== undefined && data[name] !== null? data[name]: defaultValue);
            if((type == 'selecttabledata' || type == 'datafile')){
                rest._defaultValue = data[rest.name];
            }
        } else {
            rest.defaultValue  = defaultValue;
        }
        if(rest.defaultValue === null){
            rest.defaultValue = undefined;
        }
        // les champs de type date par défaut qui sont requis, auront comme valeur par défaut la date actuelle s'il ne sont pas définies
        if(rest.autoSetDefaultValue !== false && (!rest.defaultValue && typeof rest.defaultValue !=='boolean' && typeof rest.defaultValue !=='number')){
            if(isDate && rest.required === true ){
                rest.defaultValue = new Date();
            } else if(!isDate && isNonNullString(rest.appConfigDefaultValueKey)){
                rest.defaultValue = appConfig.get(rest.appConfigDefaultValueKey);
            }
        }
        const Component = getComponentFromType(jsType);
        if(typeof onLoopField ==='function'){
            onLoopField({...props,...fieldProp,formName,responsive,responsiveProps,...rest,type,jsType,primaryKey,name,isDate,index,disabled:disabled||archived,archivable})
        }
        return <Component 
            {...props}
            data = {data} 
            windowWidth = {windowWidth}
            index = {index} 
            disabled = {disabled || archived} 
            archived = {archived}
            {...fieldProps}
            {...rest}
            style = {[fieldProps.style,Colors.isValid(backgroundColor) && {backgroundColor},rest.style]}
            formName = {formName}
            key={index} 
            type = {type}
            jsType = {jsType}
            archivable = {archivable}  
            name = {name}
            responsive = {responsive}
            responsiveProps = {{...responsiveProps,...customResponsiveProps,style:[responsiveProps.style,customResponsiveProps.style]}}
        />
    },[type,jsType,defaultValue,rest,windowWidth,backgroundColor,isFilter,name,!!responsive]);
});

FieldContentComponent.displayName = "FieldContentComponent";

export default FieldContentComponent;

FieldContentComponent.propTypes = {
    field : PropTypes.object.isRequired,
    data : PropTypes.object,
    formName : PropTypes.string.isRequired,
    responsiveProps : PropTypes.object,
}