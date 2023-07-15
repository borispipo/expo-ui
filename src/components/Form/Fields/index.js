import Field from "./Field"
import TextField from "./TextField";
import SelectField from "./SelectField";
import Switch from "./Switch";
import Checkbox from "./Checkbox";
import SelectTableData from "./SelectTableData";
import SelectCurrency from "./SelectCurrency";
import IDField from "./IdField";
import Slider from "./Slider";
import ColorPicker from "./Color";
import Date from "./Date";
import DateTime from "./DateTime";
import Time from "./Time";
import Image from "./Image";
import Tel from "./Tel";
import SelectCountry from "./SelectCountry";
import Html from "./Html";
import "$cutils";
import React from "$react";
import SelectDateFormat from "./SelectDateFormat";
import CurrencyFormat from "./CurrencyFormat";

const defFormFields = {
    Field,
    TextField, 
    SelectField,
    SelectTableData,
    SelectCountry,
    SelectCurrency
    ,CurrencyFormat
    ,Switch
    ,Checkbox
    //,IdField
    ,IDField
    ,Slider
    ,ColorPicker
    ,Date
    ,DateTime
    ,Time
    ,Image
    ,Tel
    ,SelectDateFormat
    ,Html
}

export default defFormFields;

export {
    Field,
    TextField, 
    SelectField,
    SelectTableData,
    SelectCountry
    ,SelectCurrency
    ,CurrencyFormat
    ,Switch
    ,Checkbox
    //,IdField
    ,IDField
    ,Slider
    ,ColorPicker
    ,ColorPicker as Color
    ,Date
    ,Time
    ,Image
    ,Tel
    ,SelectDateFormat
    ,Html
}

export const extendFields = (fields)=>{
    Object.map(fields,(f,i)=>{
        if(React.isComponent(f)){
            defFormFields[i] = f;
        }
    })
}

export const extendFormFields = extendFields;