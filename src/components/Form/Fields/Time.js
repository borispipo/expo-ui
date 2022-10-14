import {Time} from "$components/Date";
import {defaultObj} from "$utils";
import Field  from"./Field";
import React from "react";
import DateLib from "$lib/date";

export default class FormTimeField extends Field{
    getValidValue(){
        const v = super.getValidValue();
        return DateLib.isDateObj(v)? v.toSQLTime() : isNonNullString(v)? v : undefined;
    }
    canFocus(){
        return false;
    }
    _render(props){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <Time
            {...props}
        />
    }
}


FormTimeField.propTypes = {
    ...defaultObj(Date.propTypes),
}