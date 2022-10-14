import { Switch,TouchableRipple } from 'react-native-paper';
import {Pressable} from "react-native";
import View from "$ecomponents/View";
import React from "$react";
import {isUndefined,defaultObj,defaultVal,defaultStr,defaultBool} from "$utils";
import theme,{Colors,DISABLED_OPACITY} from "$theme";
import {StyleSheet} from "react-native";
import PropTypes from "prop-types";
import Tooltip from "$ecomponents/Tooltip";
import HelperText from "$ecomponents/HelperText";
import Label from "$ecomponents/Label";

export const leftPosition = 'left';
export const rightPosition = "right";
const SwitchComponent = React.forwardRef((props,ref)=>{
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
        on,
        onPress,
        onValue,
        offValue,
        checkedTooltip,
        onChange,
        uncheckedTooltip,
        uncheckedLabel,
        helperText,
        labelProps,
        position,
        labelStyle,
        tooltip,
        checked,
        testID,
        title,
        editable,
        disabled,
        readOnly,
        right,
        left,
        width,
        height,
        ...p
    } = props;
    p = defaultObj(p);
    disabled = defaultBool(disabled,false);
    const isEditable = !disabled && readOnly !== true && editable !== false ? true : false;
    const pointerEvents = isEditable ? "auto" : "none";
    checkedValue = defaultVal(onValue,checkedValue,1);
    uncheckedValue = defaultVal(offValue,uncheckedValue,0);
    on = defaultVal(on,checked);
    if(!isUndefined(on)){
        defaultValue = on ?checkedValue : uncheckedValue;
    } 
    defaultValue = defaultVal(defaultValue,value,0);
    const [isSwitchOn,setIsSwitchOn] = React.useStateIfMounted(defaultValue == checkedValue ? true : false)
    const toggleIsSwitchOn = (a)=> {
        if(typeof onPress ==='function' && onPress(a) === false){
            return;
        }
        setIsSwitchOn(!isSwitchOn);
    };
    const previousIsSwitchOn = React.usePrevious(isSwitchOn);
    if(isSwitchOn){
        label = defaultVal(checkedLabel,label,text)
        tooltip = defaultStr(checkedTooltip,tooltip,title);
    } else {
        label = defaultVal(uncheckedLabel,label,text)
        tooltip = defaultStr(uncheckedTooltip,tooltip,title);
    }
   React.useEffect(()=>{
        if(previousIsSwitchOn !== isSwitchOn){
            if(typeof onChange =='function'){
               onChange({checked:isSwitchOn,isSwitchOn,isOn:isSwitchOn,isOff:!isSwitchOn,value:isSwitchOn?checkedValue:uncheckedValue,label:isSwitchOn?checkedLabel:uncheckedLabel});
            }
        }
   },[isSwitchOn])
   const setValue = (defaultValue)=>{
        const isOn = defaultValue == checkedValue ? true : false;
        if(isOn === isSwitchOn) return;
        setIsSwitchOn(isOn);
   }
   React.useEffect(()=>{
        setValue(defaultValue);
   },[defaultValue])
   const context = {setValue};
   React.useEffect(()=>{
       React.setRef(ref,context);
       return ()=>{
           React.setRef(ref,null);
       }
   },[])
   position = defaultStr(position).toLowerCase();
   if(position !== leftPosition && position !== rightPosition){
       position = leftPosition;
   }
   labelProps = defaultObj(labelProps)
   const isLeftPosition = position === leftPosition;
   const disabledStyle = undefined;//disabled ? {opacity : DISABLED_OPACITY} : undefined;
   const sw = <Switch
        disabled = {disabled}
        editable = {isEditable}
        pointerEvents={pointerEvents}
        style = {[{paddingHorizontal:0,['margin'+(isLeftPosition?'Right':'Left')]:10},style,disabledStyle]}
        value = {isSwitchOn}
        onValueChange = {setIsSwitchOn}
        color = {Colors.isValid(p.color)? p.color : theme.colors.primaryOnSurface}
    />
   return <Tooltip 
                {...p} 
                tooltip={tooltip} 
                accessibilityLabel={label}
                accessibilityRole="switch"
                disabled = {!isEditable}
                pointerEvents = {pointerEvents}
                accessibilityState={{checked:isSwitchOn}}
                testID={testID}
                style={[p.style,disabledStyle]}
                ref={ref}
            >
                <TouchableRipple  onPress={toggleIsSwitchOn} style={[disabledStyle]}>
                    <View importantForAccessibility="no-hide-descendants" pointerEvents={pointerEvents} style={[styles.wrap,p.style,styles.container,]}>
                        { isLeftPosition ? sw: null}
                        {<Label {...labelProps} pointerEvents={pointerEvents} disabled = {disabled} style={[styles.label,labelStyle,labelProps.style,error?{color:theme.colors.error}:undefined]} >{label}</Label>}
                        {!isLeftPosition ? sw : null}
                    </View>
                </TouchableRipple>
                <HelperText error={error} disabled={!isEditable}>{helperText}</HelperText>
            </Tooltip>
});

SwitchComponent.propTypes = {
    ...defaultObj(Switch.propTypes),
    rippleProps : PropTypes.object, // les props du tooltip à exploiter pour le rendu du switch
    labelProps : PropTypes.object,//les props du label
    checkedValue : PropTypes.any,
    onValue : PropTypes.any,
    offValue : PropTypes.any,
    uncheckedValue : PropTypes.any,
    checkedLabel : PropTypes.string,
    uncheckedLabel : PropTypes.string,
    checkedTooltip : PropTypes.string,
    uncheckedTooltip : PropTypes.string,
}

const styles = StyleSheet.create({
    wrap : {
        justifyContent: 'space-between',
        paddingHorizontal : 0,
        paddingVertical : 5,
    },
    container : {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical : 7,
    },
    label: {
      fontSize: 16,
      flexShrink: 1,
      flexGrow: 1,
    },
  });

  export default SwitchComponent;

  SwitchComponent.displayName = "SwitchComponent";