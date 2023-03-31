import React from "$react";
import {defaultObj} from "$cutils";
import { Text } from "react-native-paper";
import {DISABLED_OPACITY} from "$theme";
import {defaultStr} from "$cutils";
const PassWordTextComponent = React.forwardRef((props,ref)=>{
    const {children,label,text,...rest} = props;
    const l = defaultStr(children,label,text);
    let counter = 0,ret = "";
    while(counter < l.length){
        ret+="."
        counter++;
    }
    return <Text
        {...defaultObj(rest)}
        style = {[props.style,props.disabled ? {opacity:DISABLED_OPACITY} : undefined]}
        ref = {ref}
    >
        {ret}
    </Text>
})

export default PassWordTextComponent;

PassWordTextComponent.propTypes = {
    ...defaultObj(Text.propTypes)
}

PassWordTextComponent.displayName = "PassWordTextComponent";