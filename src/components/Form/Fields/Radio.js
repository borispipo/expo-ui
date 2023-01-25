import Radio from "$ecomponents/Radio";
import {defaultObj} from "$utils";
import Field  from"./Field";
import React from "react";
export default class FormRadioField extends Field{
    canFocus(){
        return false;
    }
    isTextField(){
        return false;
    }
    _render(props,setRef){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <Radio
            {...props}
            ref = {setRef}
        />
    }
}


FormRadioField.propTypes = {
    ...defaultObj(Radio.propTypes),
}