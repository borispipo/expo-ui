import Slider from "$components/Slider";
import {defaultObj} from "$utils";
import Field  from"./Field";
import React from "react";
export default class FormSliderField extends Field{
    canFocus(){
        return false;
    }
    isTextField(){
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
        return <Slider
            {...props}
            ref = {setRef}
        />
    }
}


FormSliderField.propTypes = {
    ...defaultObj(Slider.propTypes),
}