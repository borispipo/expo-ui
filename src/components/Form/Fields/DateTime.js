import DateTime from "$ecomponents/Date/DateTime";
import {defaultObj} from "$cutils";
import Field  from"./Field";
import React from "react";
import DateLib from "$lib/date";

export default class FormDateTimeField extends Field{
    getValidValue(){
        const v = super.getValidValue();
        return DateLib.isDateObj(v)? v.toSQLDateTime() : isNonNullString(v)? v : undefined;
    }
    _render(props){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <DateTime
            {...props}
        />
    }
}

FormDateTimeField.propTypes = {
    ...defaultObj(DateTime.propTypes),
}