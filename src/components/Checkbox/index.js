import { Checkbox } from 'react-native-paper';
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

const CheckboxComponent = React.forwardRef((props,ref)=>{
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
        disabled,
        readOnly,
        primaryOnCheck,
        secondaryOnCheck,
        stopEventPropagation,
        testID,
        uncheckedColor,
        ...p
    } = props;
    disabled = defaultBool(disabled,false);
    const isEditable = !disabled && readOnly !== true ? true : false;
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
   const changeEventRef = React.useRef(null);
   React.useEffect(()=>{
        if(previousStatus !== status){
            if(typeof onChange =='function'){
               onChange({event:changeEventRef.current,checked,value:checked?checkedValue:uncheckedValue,label:checked?checkedLabel:uncheckedLabel});
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
   let cColor = Colors.isValid(p.color)? (theme.isDark()?theme.colors.text : p.color) : theme.colors.primaryOnSurface;
   if(primaryOnCheck ===true && status ==checkedStatus){
       cColor = theme.colors.primaryOnSurface;
   } else if(secondaryOnCheck ===true && status === checkedStatus){
       cColor = theme.colors.secondaryOnSurface;
   }
   uncheckedColor = Colors.isValid(uncheckedColor)? uncheckedColor : theme.colors.text;
   const disabledStyle = disabled ? {opacity : DISABLED_OPACITY} : undefined;
   testID = defaultStr(testID,"RN_CheckboxComponent");
   return <View testID={testID+"_Container"} {...containerProps} style={[containerProps.style,disabledStyle]} pointerEvents={pointerEvents}>
        <Tooltip
            Component = {Checkbox.Item}
            {...p}
            testID = {testID}
            disabled = {disabled}
            readOnly = {!isEditable}
            style = {[styles.checkbox,style,{pointerEvents}]}
            position = {position}
            status = {status}
            color = {cColor}
            theme = {theme}
            uncheckedColor = {uncheckedColor}
            labelStyle = {[styles.label,{color:theme.colors.text},labelStyle,lStyle,disabledStyle]}
            onPress={!isEditable ? undefined : (e)=>{
                changeEventRef.current = e;
                changeEventRef.current.pressed = true;
                if(stopEventPropagation !== false){
                    React.stopEventPropagation(e);
                }
                if(typeof onPress =="function" && onPress({event:e,checked,value:checked?checkedValue:uncheckedValue,label:checked?checkedLabel:uncheckedLabel}) ===false){
                    return;
                }
                setStatus(status === checkedStatus ? uncheckedStatus : checkedStatus);
            }}
        />
        {<HelperText testID = {testID+"_HelperText" }error={error} disabled={!isEditable}>{helperText}</HelperText>}
    </View>
});
CheckboxComponent.propTypes = {
    ...defaultObj(Checkbox.Item.propTypes),
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

export default CheckboxComponent;

CheckboxComponent.displayName = "CheckboxComponent";