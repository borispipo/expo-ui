import Switch from "$ecomponents/Switch";
import {defaultObj} from "$cutils";
import Field  from"./Field";
import React from "react";
export default class FormSwitchField extends Field{
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
        return <Switch
            {...props}
            ref = {setRef}
            onPress = {typeof this.props.onPress =='function' ? (e)=>{
                return this.props.onPress({event:e,context:this})
            } : undefined}
        />
    }
}


FormSwitchField.propTypes = {
    ...defaultObj(Switch.propTypes),
}