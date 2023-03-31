import Slider from "$ecomponents/Slider";
import {defaultObj} from "$cutils";
import Field  from"./Field";
import React from "react";
export default class FormSliderField extends Field{
    canFocus(){
        return false;
    }
    isTextField(){
        return false;
    }
    _render(props,setRef){
        props.onChange = (args)=>{
            args.value = this.parseDecimal(args.value);
            this.validate(args);
        }
        return <Slider
            {...props}
            ref = {setRef}
        />
    }
}


FormSliderField.propTypes = {
    ...defaultObj(Slider.propTypes),
}