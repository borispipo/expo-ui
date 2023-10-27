import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import React from "$react";
import {getMaxZindex} from "$cutils/dom";
import PropTypes from "prop-types";
import Label from "$ecomponents/Label";
import { TIPPY_THEME } from '$theme/updateNative/utils';
import {isDOMElement} from "$cutils/dom";
import {uniqid,defaultStr,defaultObj} from "$cutils";
import {Pressable} from "react-native";

const TippyTooltipComponent  = React.forwardRef(({children,onPress,onPressOut,content,onPressIn,onLongPress,testID,...rest},ref)=>{
    const hasPress = onPress || onPressOut || onPressIn || onLongPress;
    testID = defaultStr(testID,"RN_TooltipPopoverComponent")
    const instanceIdRef = React.useRef(uniqid("tippy-instance-id")); 
    const buttonRef = React.useRef(null);
    const innerRef = React.useMergeRefs(ref,buttonRef);
    const selector = "#"+instanceIdRef.current;
    React.useEffect(()=>{
        content = React.getTextContent(content);
        if(typeof content =='string'){
            content = content.replaceAll("\n","<br/>");
        }
        if(!content) return;
        const tpI = tippy(isDOMElement(buttonRef.current)? buttonRef.current:selector,{
            content,
            allowHTML : true,
            theme : TIPPY_THEME,
            onShow : (instance)=>{
                if(instance && typeof(instance.setProps) ==="function"){
                    instance.setProps({
                        zIndex:getMaxZindex()
                    })
                }
            }
        });
        const instance = Array.isArray(tpI) ? tpI[0] : tpI;
        //React.setRef(ref,instance);
        return ()=>{
            React.setRef(ref,null);
            if(instance && instance.destroy){
                instance.destroy();
            }
        }
    },[content])
    const cProps = {
        ...defaultObj(rest),
        id:instanceIdRef.current,
    }
    const isChildF = typeof children =='function';
    children = isChildF ? children(cProps,innerRef) : children;
    if(!hasPress){
        if(isChildF) return children;
        return <Label {...cProps} testID={testID} ref={innerRef}>
            {children}
        </Label>
    }
    if(!React.isValidElement(children)){
        return null;
    }
    return <Pressable {...{onPress,onLongPress,onPressIn,onPressOut}} {...cProps} testID={testID} ref={innerRef}>
        {children}
    </Pressable>
    return  
});
TippyTooltipComponent.propTypes = {
    content: PropTypes.any, //le contenu du tooltip
    title : PropTypes.string, //le contenu du tooltip
}

export default TippyTooltipComponent;