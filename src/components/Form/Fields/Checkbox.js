import Checkbox from "$ecomponents/Checkbox";
import {defaultObj,isNonNullString} from "$utils";
import Field  from"./Field";
import React from "react";
export default class FormCheckboxField extends Field{
    canFocus(){
        return false;
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