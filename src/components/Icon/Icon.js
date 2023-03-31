import {defaultVal,defaultObj,defaultStr,isNonNullString} from "$cutils";
import PropTypes from "prop-types";
import Tooltip from "$ecomponents/Tooltip";
import theme,{flattenStyle,Colors} from "$theme";
import React from "$react";
import {IconButton} from "react-native-paper"

const IconComponentRef = React.forwardRef((props,ref)=>{
    let {icon,style,Component,button,color,name,...rest} = props;
    icon = defaultVal(icon,name);
    if(isNonNullString(icon)){
        icon = icon.trim().ltrim("")
    }
    if(!icon && rest.source){
        icon = rest.source;
    }
    if(icon){
        rest.icon = icon;
    }
    if(!rest.icon) return null;
    const flattenedStyle = flattenStyle(style);
    if(button === false){
        flattenedStyle.borderRadius = 0;
    }
    const iconColor = Colors.isValid(color) ? color : Colors.isValid(rest.iconColor)? rest.iconColor : Colors.isValid(flattenedStyle.color)? flattenedStyle.color : theme.colors.text
    return <Tooltip 
        animated 
        {...rest}  
        color={iconColor}
        iconColor = {iconColor} 
        style = {flattenedStyle}
        Component={React.isComponent(Component)?Component:IconButton}
        ref = {ref}
    />
});
const IconComponent = theme.withStyles(IconComponentRef,{mode : 'normal'});
IconComponent.propTypes = {
    ...defaultObj(IconButton.propTypes),
    name : defaultVal(IconButton.propTypes,PropTypes.string),
    button : PropTypes.bool, //si c'est un icon button
}

IconComponent.displayName = "IconComponent";

export default IconComponent;

IconComponent.Avatar = React.forwardRef(({...props},ref)=>{
    return <IconComponent
        Component = {IconButton}
        {...props}
    />
})
IconComponent.Avatar.displayName = "IconComponent.Avatar";
IconComponent.Avatar.propTypes = {
    ...IconComponent.propTypes,
}