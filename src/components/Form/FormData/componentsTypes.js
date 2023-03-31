import {defaultStr,isNonNullString,defaultObj,defaultVal,isObj} from "$cutils";
import Fields from "../Fields";
//import dataFileManager from "$dataFileManager";
import i18n from "$i18n";
import React from "$react";

const componentTypes =  {
    ...Fields,
    id : Fields.IdField,
    selecttabledata : Fields.SelectTableData,
    idfield : Fields.IdField,
    piecefield : Fields.PieceField,
    piece : Fields.PieceField,
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
    datafile : Fields.DataFile,
    image : Fields.Image,
    schedule : Fields.Scheduler,
    scheduler : Fields.Scheduler,
    default : Fields.TextField,
};

export default componentTypes;


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
        onValidate,
        checkPiece,
        check,
        width,
        type,
        jsType,
        ...props
    } = _props;
    props = defaultObj(props);
    let component = Fields.TextField;
    type = defaultStr(jsType,type,'text').toLowerCase().replaceAll("_","").replaceAll("-","").trim();
    const sanitizedType = type.replaceAll("_","").toLowerCase().trim();
    props = defaultObj(props);
    props.label = defaultStr(label,text);
    if(type.startsWith("select")){
        props.inputProps = Object.assign({},props.inputProps);
        props.inputProps.placeholder = defaultStr(props.inputProps.placeholder,i18n.lang("search.."))
        component = Fields.SelectField;
        if(type =='select_country' || type =='selectcountry'){
            component = Fields.SelectCountry;
        } else if(type =='select_tabledata' || type =='selecttabledata'){
            component = Fields.SelectTableData;
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
        component = Fields.SelectField;
    } else if(type == "date" || type =="time" || type =='datetime'){
        component = type == 'datetime' ? Fields.DateTime : type === 'date'? Fields.Date : Fields.Time;
    }  else if(type == 'color' || type =='colorpicker') {
        component = Fields.ColorPicker;
    } else if(type == 'dateformat' || type =='select_dateformat' || type =='select_date_format') {
        component = Fields.SelectDateFormat;
    } else if(React.isComponent(componentTypes[type])) {
        component = componentTypes[type];
    } else if(isNonNullString(props.foreignKeyColumn) && isNonNullString(props.foreignKeyTable)) {
        component = Fields.SelectTableData;
        type = "select";
    }else {
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
    if(type.contains("date") || type.contains("time")){
        delete props.right;
    }
    delete props.width;
    delete props.onAdd;
    delete props.onAddProps;
    return {Component:component,props,type};
}