import { RadioButton } from 'react-native-paper';
import View from "$ecomponents/View";
import React from "$react";
import {isUndefined,defaultObj,defaultVal,defaultStr} from "$cutils";
import {isIos,isAndroid} from "$cplatform";
import theme,{Colors,DISABLED_OPACITY,ALPHA_OPACITY} from "$theme";
import { StyleSheet } from 'react-native';
export const checkedStatus = 'checked';
export const uncheckedStatus = 'unchecked';
import PropTypes from "prop-types";
import Tooltip from "$ecomponents/Tooltip";
import HelperText from "$ecomponents/HelperText";
export const leftPosition = 'leading';
export const rightPosition = "trailing";

export const CHECKED_ICON_NAME = isIos()? 'check':'check';

export const UNCHECKED_ICON_NAME = isIos() ?'' : '' 

const RadioComponent = React.forwardRef((props,ref)=>{
    let {
        checkedValue,
        uncheckedValue,
        defaultValue,
        value,
        label,
        text,
        checkedLabel,
        error,
        style,
        onPress,
        checkedTooltip,
        onChange,
        uncheckedTooltip,
        containerProps,
        uncheckedLabel,
        labelStyle,
        helperText,
        position,
        editable,
        disabled,
        readOnly,
        primaryOnCheck,
        secondaryOnCheck,
        ...p
    } = props;
    disabled = defaultBool(disabled,false);
    const isEditable = !disabled && readOnly !== true && editable !== false ? true : false;
    const pointerEvents = isEditable ? "auto" : "none";
    p = defaultObj(p);
    checkedValue = defaultVal(checkedValue,1);
    uncheckedValue = defaultVal(uncheckedValue,0);
    if(!isUndefined(p.checked)){
        defaultValue = p.checked?checkedValue : uncheckedValue;
    } 
    delete p.checked;
    defaultValue = defaultVal(defaultValue,value,0);
    const [status,setStatus] = React.useState(defaultValue == checkedValue ? checkedStatus : uncheckedStatus)
    const previousStatus = React.usePrevious(status);
    const checked = status===checkedStatus?true:false;
    if(checked){
        p.label = defaultStr(checkedLabel,label,text)
        p.tooltip = defaultStr(checkedTooltip,p.tooltip,p.title);
    } else {
        p.label = defaultStr(uncheckedLabel,label,text)
        p.tooltip = defaultStr(uncheckedTooltip,p.tooltip,p.title);
    }
   if(isIos()){
       p.mode = "ios";
   } else if(isAndroid()){
       p.mode = "android";
   } else delete p.mode;
   React.useEffect(()=>{
        if(previousStatus !== status){
            if(typeof onChange =='function'){
               onChange({checked,value:checked?checkedValue:uncheckedValue,label:checked?checkedLabel:uncheckedLabel});
            }
        }
   },[status])
   const setValue = (defaultValue)=>{
        const nCheckedStatus = defaultValue === checkedValue ? checkedStatus : defaultValue === uncheckedValue ? uncheckedStatus : undefined;
        if(nCheckedStatus === status || typeof nCheckedStatus !== 'string') return;
        setStatus(nCheckedStatus);
   }
   React.useEffect(()=>{
       setValue(defaultValue);
   },[defaultValue])
   const context = {
       setValue,
   }
   React.useEffect(()=>{
        React.setRef(ref,context);
        return ()=>{
            React.setRef(ref,null);
        }
   },[])
   position = defaultStr(position).toLowerCase();
   if(position =="left") position = leftPosition;
   else if(position =="right") position = rightPosition;
   if(position !== leftPosition && position !== rightPosition){
       position = rightPosition;
   }
   containerProps = defaultObj(containerProps);
   const lStyle = {};
   if(disabled){
       lStyle.color = Colors.setAlpha(theme.colors.text,ALPHA_OPACITY);
   }
   let cColor = Colors.isValid(p.color)? p.color : theme.colors.primaryOnSurface;
   if(primaryOnCheck ===true && status ==checkedStatus){
       cColor = theme.colors.primaryOnSurface;
   } else if(secondaryOnCheck ===true && status === checkedStatus){
       cColor = theme.colors.secondaryOnSurface;
   }
   const disabledStyle = disabled ? {opacity : DISABLED_OPACITY} : undefined;
   return <View {...containerProps} style={[containerProps.style,disabledStyle]} pointerEvents={pointerEvents}>
        <Tooltip
            Component = {RadioButton.Item}
            {...p}
            disabled = {disabled}
            editable = {isEditable}
            pointerEvents = {pointerEvents}
            style = {[styles.checkbox,style]}
            position = {position}
            status = {status}
            color = {cColor}
            labelStyle = {[styles.label,labelStyle,lStyle,disabledStyle]}
            onPress={(e)=>{
                if(typeof onPress =="function" && onPress({event:e,checked,value:checked?checkedValue:uncheckedValue,label:checked?checkedLabel:uncheckedLabel}) ===false){
                    return;
                }
                setStatus(status === checkedStatus ? uncheckedStatus : checkedStatus);
            }}
        />
        {<HelperText error={error} disabled={!isEditable}>{helperText}</HelperText>}
    </View>
});
RadioComponent.propTypes = {
    ...defaultObj(RadioButton.Item.propTypes),
    primaryOnCheck : PropTypes.bool,//la couleur sera primaire si l'oncheck
    secondaryOnCheck : PropTypes.bool, ///la couleur sera secondaire si la checkbox est active
    checkedValue : PropTypes.any,
    uncheckedValue : PropTypes.any,
    checkedLabel : PropTypes.string,
    containerProps : PropTypes.object, //les props de la vue container
    uncheckedLabel : PropTypes.string,
    checkedTooltip : PropTypes.string,
    uncheckedTooltip : PropTypes.string,
}

const styles = StyleSheet.create({
    container : {

    },
    checkbox : {
        paddingVertical : 10,
        paddingHorizontal:0,
        justifyContent:'flex-start'
    },
    label : {flexGrow:0,flexShrink:0,paddingVertical:10}
})

export default RadioComponent;

RadioComponent.displayName = "RadioComponent";