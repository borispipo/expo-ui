import Switch from "$components/Switch";
import {defaultObj} from "$utils";
import Field  from"./Field";
import React from "react";
export default class FormSwitchField extends Field{
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