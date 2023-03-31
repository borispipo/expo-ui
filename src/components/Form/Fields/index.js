import Field from "./Field"
import TextField from "./TextField";
import SelectField from "./SelectField";
import Switch from "./Switch";
import Checkbox from "./Checkbox";
import SelectTableData from "./SelectTableData";
import SelectCurrency from "./SelectCurrency";
//import IdField from "./IdField";
//import PieceField from "./PieceField";
import Slider from "./Slider";
import ColorPicker from "./Color";
import Date from "./Date";
import DateTime from "./DateTime";
import Time from "./Time";
import Image from "./Image";
import Tel from "./Tel";
import SelectCountry from "./SelectCountry";
import Html from "./Html";
import * as eFormFields from "$extendFormFields";
import "$cutils";
import React from "$react";
import SelectDateFormat from "./SelectDateFormat";
import CurrencyFormat from "./CurrencyFormat";
export * from "$extendFormFields";

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
    //,PieceField
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

//pour étendre les FormFields par défaut
Object.map(eFormFields,(F,i)=>{
    if(React.isComponent(F)){
        defFormFields[i] = F;
    }
})

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
    //,PieceField
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