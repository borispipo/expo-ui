import Popover from "./Popover";
import {defaultObj,defaultVal} from "$utils";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import React from "$react";
export const actions = {press:'press',longpress:'longpress',hover:'hover'};

export const positions = {top:"top",right:"right",bottom:"bottom",left:"left"}

/***
 * for more documentation @see : https://github.com/eveningkid/react-native-popable#popable.children
 */

const TooltipComponent = React.forwardRef((props,ref)=>{
    let {tooltipProps,position,Component,children,strictPosition,...rest} = props;
    rest = defaultObj(rest);
    tooltipProps = defaultObj(tooltipProps);
    Component = React.isComponent(tooltipProps.Component) ? tooltipProps.Component : React.isComponent(Component) ? Component : Label;
    delete tooltipProps.position;
    const content = defaultVal(rest.content,rest.tooltip,rest.title,rest.label,rest.accessibilityLabel);
    if(typeof children !=='function'){
        rest.children = children;
    }
    const ct = <Component {...rest}/>
    if(!content || rest.disabled === true || rest.readOnly === true || rest.editable === false){
        return typeof children =='function'? children(rest,ref) : ct;
    }
    return <Popover 
        {...tooltipProps} 
        content = {content}  
        onLongPress = {rest.onLongPress}
        onPressIn = {rest.onPressIn}
        onPressOut = {rest.onPressOut}
        onPress = {rest.onPress}
        ref = {ref}
    >
        {typeof children =='function'? children : ct}
    </Popover>
})

export default TooltipComponent;
TooltipComponent.displayName = "TooltipComponent";