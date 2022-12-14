import Checkbox from "$ecomponents/Checkbox";
import {defaultObj,isNonNullString} from "$utils";
import Field  from"./Field";
import React from "react";
export default class FormCheckboxField extends Field{
    canFocus(){
        return false;
    }
    setValue (value){
        if(this._fieldRef && this._fieldRef.setValue){
            return this._fieldRef.setValue(value);
        }
    }
    _render(props,setRef){
        props.onChange = (args)=>{
            args.value = this.parseDecimal(args.value);
            this.validate(args);
        }
        return <Checkbox
            {...props}
            ref = {setRef}
        />
    }
}


FormCheckboxField.propTypes = {
    ...defaultObj(Checkbox.propTypes),
}