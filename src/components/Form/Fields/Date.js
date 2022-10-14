import Date from "$ecomponents/Date";
import {defaultObj} from "$utils";
import Field  from"./Field";
import React from "react";
import DateLib from "$lib/date";

export default class FormDateField extends Field{
    getValidValue(){
        const v = super.getValidValue();
        return DateLib.isDateObj(v)? v.toSQLDate() : isNonNullString(v)? v : undefined;
    }
    _render(props){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <Date
            {...props}
        />
    }
}

FormDateField.propTypes = {
    ...defaultObj(Date.propTypes),
}