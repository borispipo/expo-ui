import { Avatar } from "react-native-paper";
import {Colors} from "$theme"; 
import {defaultDecimal,isNumber,defaultVal,isValid,defaultStr,defaultObj} from "$utils";
import {StyleSheet} from "react-native";
import React from "react";
import Text from "./Text";
import theme from "$theme";
import AvatarImage from "./Image";
import { Pressable } from "react-native";
import Tooltip from "$components/Tooltip";

const defaultSize = 40;

/*** for more documentation 
 * @see : https://callstack.github.io/react-native-paper/avatar-text.html
 * @see : https://callstack.github.io/react-native-paper/avatar-image.html
 * @see : https://callstack.github.io/react-native-paper/avatar-icon.html
 * 
 */
const AvatarComponent = React.forwardRef((props,ref)=>{
    let Component = undefined;
    let {image,icon,testID,color,title,toolip,src,onPress,containerProps,useSuffix,suffix,size,children,label,source,text,...rest} = props;
    label = defaultVal(label,text,children);
	if(typeof label =='number') label = label+"";
    rest = defaultObj(rest);
    containerProps = defaultObj(containerProps);
    size = defaultDecimal(size,defaultSize)
    let cProps = {size};
    if(source || image || src){
        Component = AvatarImage;
        cProps.source = source || {uri:src};
    } else if(icon){
        Component = Avatar.Icon;
        cProps.icon = icon;
    } else if(label){
        cProps.label = label;
        cProps.pointerEvents = "none";
        cProps.labelStyle = StyleSheet.flatten(cProps.labelStyle) || {};
        Component = Text;
    }
    if(!Component){
        console.error("Error on avatar, components not defined using props",props,label);
        return null;
    }
    if(React.isValidElement(icon)){
        return icon
    }

    let style = StyleSheet.flatten([styles.container,cProps.style,rest.style,styles.center]);
    const hasColor = Colors.isValid(color);
    color = hasColor? color : Colors.isValid(style.color) ? style.color : undefined;
    if((!color || useSuffix) && isNumber(suffix)){
        style = [style,{...cProps,...Colors.getAvatarStyleFromSuffix(suffix)}];
    } else if(hasColor){
        style.backgroundColor = color;
        style.color = Colors.getContrast(color);
    }
    const c = <Component
            {...rest}
            {...cProps}
            ref={ref}
            title = {onPress?null : defaultVal(toolip,title)}
            testID = {defaultStr(testID,"RN_AvatarComponent")}
            style = {style}
            size= {size}
        />;
    return onPress ?  <Tooltip title={title} toolip={toolip} Component = {Pressable} testID={testID+"_Container"} {...containerProps} onPress={onPress}>{c}</Tooltip> : c;
});

AvatarComponent.displayName = "AvatarComponent";

export default theme.withStyles(AvatarComponent,{
    displayName : "AvatarComponent",
    mode  : "contained",
});

const styles = StyleSheet.create({
    container : {
        paddingVertical : 0,
        marginVertical : 0,
    },
    center : {
        justifyContent : 'center',
        paddingHorizontal:0,
        paddingVertical : 0,
        alignItems : 'center',
        alignSelf:'center'
    },
})

AvatarComponent.Text = Text;


export {Text};