import {defaultStr,isNonNullString,defaultObj,defaultVal,isObj} from "$cutils";
import Fields from "../Fields";
//import dataFileManager from "$dataFileManager";
import i18n from "$i18n";
import React from "$react";


export const getComponentTypes = ()=>{
    return {
        id : Fields.IDField,
        idfield : Fields.IdField,
        select : Fields.SelectField,
        switch : Fields.Switch,
        selectcountry : Fields.SelectCountry,
        selectdateformat : Fields.SelectDateFormat,
        selectcurrency : Fields.SelectCurrency,
        currencyformat : Fields.CurrencyFormat,
        dateformat : Fields.SelectDateFormat,
        date : Fields.Date,
        time : Fields.Time,
        datetime  : Fields.DateTime,
        date2time : Fields.DateTime,
        checkbox : Fields.Checkbox,
        slider : Fields.Slider,
        color : Fields.ColorPicker,
        tel : Fields.Tel,
        html : Fields.Html,
        image : Fields.Image,
        schedule : Fields.Scheduler,
        scheduler : Fields.Scheduler,
        default : Fields.TextField,
        ...Fields,
    };
}
export function getComponentFromType(type){
    const types = getComponentTypes();
    if(!isNonNullString(type)){
        return types.default;
    }
    if(React.isComponent(types[type])){
        return types[type]; 
    }
    type = type.trim().toLowerCase().replaceAll(" ","").replaceAll("-","").replaceAll("_","");
    return React.isComponent(types[type]) && types[type] || types.default;
};

export default getComponentFromType;


/**** pour interdire qu'on composant FormField soit utilisé en cas de filtre, il suffit de passer au composant FormField, la props filter à false */

export const getFilterComponentProps = (_props)=>{
    let {
        validType,
        validRule,
        required,//label,text,title,
        onAdd,
        onAddIconClass,
        addIcon,
        disabled,
        readOnly,
        onAddIcon,
        tableName,
        multiplicater,
        dbName,
        table,
        piece,
        onChange,
        error,
        errorText,
        label,text,
        primary,
        checkPiece,
        check,
        width,
        type,
        visible,
        jsType,
        filterType,
        getValidValue,
        validate,
        onValidatorValid,///il s'agit de la fonction de rappel appelée immédiatement après que le validateur ait réuissie la validation
        onValidateField,
        onNoValidate,
        ...props
    } = _props;
    props = defaultObj(props);
    const componentTypes = getComponentTypes();
    let component = componentTypes.TextField;
    type = defaultStr(filterType,jsType,type,'text').toLowerCase().replaceAll("_","").replaceAll("-","").trim();
    const sanitizedType = type.replaceAll("_","").toLowerCase().trim();
    props = defaultObj(props);
    props.label = defaultStr(label,text);
    if(sanitizedType.startsWith("select")){
        props.inputProps = Object.assign({},props.inputProps);
        props.inputProps.placeholder = defaultStr(props.inputProps.placeholder,i18n.lang("search.."))
        component = componentTypes.SelectField;
        if(sanitizedType ==='selectcountry'){
            component = componentTypes.SelectCountry;
        } else if(sanitizedType ==='selecttabledata'){
            component = componentTypes.SelectTableData;
        } else if(React.isComponent(componentTypes[type])){
            component = componentTypes[type];
        } else if(React.isComponent(componentTypes[sanitizedType])){
            component = componentTypes[sanitizedType];
        }
        type = "select";
    } else if(type == 'switch' || type =='radio' || type ==='checkbox') {
        type = 'select';
        let {checkedLabel,checkedTooltip,uncheckedTooltip,checkedValue,uncheckedLabel,uncheckedValue,...pR} = props;
        checkedLabel = defaultVal(checkedLabel,'Oui')
        uncheckedLabel = defaultVal(uncheckedLabel,'Non')
        checkedValue = defaultVal(checkedValue,1); uncheckedValue = defaultVal(uncheckedValue,0)
        props = pR;
        props.items = [{code:checkedValue,label:checkedLabel},{code:uncheckedValue,label:uncheckedLabel}];
        component = componentTypes.SelectField;
    } else if(type == "date" || type =="time" || type =='datetime'){
        component = type == 'datetime' ? componentTypes.DateTime : type === 'date'? componentTypes.Date : componentTypes.Time;
    }  else if(type == 'color' || type =='colorpicker') {
        component = componentTypes.ColorPicker;
    } else if(type == 'dateformat' || type =='select_dateformat' || type =='select_date_format') {
        component = componentTypes.SelectDateFormat;
    } else if(isNonNullString(props.foreignKeyColumn) && isNonNullString(props.foreignKeyTable)) {
        component = componentTypes.SelectTableData;
        type = "select";
    } else if(React.isComponent(componentTypes[type]) && componentTypes[type] !== false) {
        component = componentTypes[type];
    } else {
        if(React.isComponent(componentTypes[sanitizedType])){
            component = componentTypes[sanitizedType];
        } 
        delete props.dbName;
        delete props.tableName;
        delete props.fieldName;
    }
    type = type || "text"
    if(type =='select'){
        props.multiple = true;
    }
    props.renderFilter = true;
    props.isFilter = true;
    if(type.contains("date") || type.contains("time")){
        delete props.right;
    }
    delete props.width;
    delete props.onAdd;
    delete props.onAddProps;
    return {Component:component,props,type};
}