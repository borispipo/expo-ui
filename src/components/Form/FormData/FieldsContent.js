import React from "$react";
import Divider from "$ecomponents/Divider";
import {isObj,isNonNullString,defaultStr,defaultObj} from "$utils";
import getComponentFromType from "./componentsTypes";
import appConfig from "$capp/config";
import {flattenStyle,Colors} from "$theme";

export default function FieldsContent({fields,formName,disabled,archived,archivable,fieldProps,primaryKeyFields,responsiveProps,responsive,style,data,windowWidth}){
    windowWidth = typeof windowWidth ==='number' && windowWidth > 100?windowWidth : undefined;
    return React.useStableMemo(()=>{
        const content = [];
        style = defaultObj(flattenStyle(style));
        primaryKeyFields = Array.isArray(primaryKeyFields) ? primaryKeyFields: [];
        fieldProps = defaultObj(fieldProps);
        Object.map(fields,(field,index,i)=>{//on ignore tous les champs supposés être à ignorer
            if(field === 'divider'){
                content.push(<Divider key = {index} style={theme.styles.w100}/>)
            } else if(isObj(field) && field.form !== false) {
                const name = defaultStr(field.name,field.field,index);
                const type = defaultStr(field.jsType,field.type,"text").trim().toLowerCase().replaceAll(" ","").replaceAll("-","").replaceAll("_","");
                const isDate = (type.contains('date') || type.contains('time'));
                const Component = getComponentFromType(defaultStr(field.jsType,field.type,"text"));
                let {defaultValue,useDefaultValueFromData,primaryKey,hidden,renderFormDataField,getMediaQueryStyle,printLabels,queryLimit,selected,value,dataFilesInterest,perm,ignore,form,responsiveProps:customResponsiveProps,...rest} = field;
                delete rest.import;
                delete rest.export;
                if(primaryKey === true && name && !field.filter){
                    primaryKeyFields[name] = field;
                }
                if(form === false || ignore || (isNonNullString(perm) && !Auth.isAllowedFromStr(perm))){
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
                customResponsiveProps = defaultObj(customResponsiveProps);
                content.push(<Component 
                        data = {data} 
                        windowWidth = {windowWidth}
                        index = {index} 
                        disabled = {disabled || archived} 
                        archived = {archived}
                        {...fieldProps}
                        {...rest}
                        style = {[fieldProps.style,Colors.isValid(style.backgroundColor) && {backgroundColor:style.backgroundColor},rest.style]}
                        formName = {formName}
                        key={index} 
                        archivable = {archivable}  
                        name = {name}
                        responsive = {responsive}
                        responsiveProps = {{...responsiveProps,...customResponsiveProps,style:[responsiveProps.style,customResponsiveProps.style]}}
                />);
            }
        });
        return content;
    },[formName,archived,archivable,disabled,fields,data,windowWidth,responsive,responsiveProps])
}