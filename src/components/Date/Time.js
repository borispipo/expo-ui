import TextField from "$ecomponents/TextField";
import Icon from "$ecomponents/Icon";
import TimePickerModal from "./TimePickerModal";
import {defaultObj,isNonNullString,defaultDecimal,isNumber,isObj} from "$utils";
import React from "$react";
import PropTypes from "prop-types";
import theme,{styles} from "$theme";
import { locale } from "./utils";
import { TouchableRipple } from "react-native-paper";
export const getDate = (hours,minutes,seconds)=>{
    return new Date(2000, 1, 1, defaultDecimal(hours), defaultDecimal(minutes),defaultDecimal(seconds))
}
export const compareTimeState = (a,b,ignoreVisible)=>{ 
    if(!a || !b) return false;
    if(ignoreVisible !== true && a.visible !== b.visible) return false;
    return a.hours === b.hours && a.minutes === b.minutes;
  }
export const parseTime = (value,withSeconds)=>{
    if(!isNonNullString(value)) return undefined;
    let split = value.trim().split(":");
    let ret = {
      hours:parseInt(split[0]) || 0,
      minutes : parseInt(split[1]) || 0,
    };
    if(withSeconds !== false){
       ret.seconds = parseInt(split[2]) || 0;
    }
    ret.date = getDate(ret.hours,ret.minutes,ret.seconds);
    ret.value = timeToString(ret,withSeconds);
    return ret;
  }
export const timeToString = (value,withSeconds)=>{
     if(!isObj(value)) return undefined;
     let {hours,minutes,seconds} = value;
     if(hours ===undefined && minutes === undefined) return undefined;
     hours = defaultDecimal(hours);
     minutes = defaultDecimal(minutes);
     seconds = defaultDecimal(seconds);
     const d = new Date(0, 0, 0, hours, minutes,seconds);
     value = d.toSQLTime();
     if(withSeconds !== false){
       return value;
     }
     return value.substring(0,5);
  }
export default function TimePickerComponent (props){
    let {right:customRight,upper,anchorProps,dialogProps,withLabel,inputProps,containerProps,mode,onChange,withSeconds,cancelLabel,confirmLabel,label,text,upperCase,defaultValue,disabled,editable,withModal,readOnly,...rest} = props;
    rest = defaultObj(rest);
    inputProps = defaultObj(inputProps);
    const isEditable = disabled !== true && readOnly !== true && editable !== false?true : false;
    withModal = defaultBool(withModal,true);
    if(!isEditable){
       withModal = false;
    }
    withSeconds = defaultBool(withSeconds,true);
    const prevDefaultValue = React.usePrevious(defaultValue);
    const [state,setState] = React.useStateIfMounted({
        visible : false,
        ...parseTime(defaultValue,withSeconds),
    })
    const prevState = React.usePrevious(state,compareTimeState)
    const formatLabel = "HH:MM"+(withSeconds !== false?":SS":"");
    label = withLabel !== false ? defaultStr(label,text)+"("+formatLabel+")":"";
    dialogProps = defaultObj(dialogProps);
    const onConfirm = ({ hours, minutes }) => {
      const seconds = withSeconds ? state.seconds : 0;
      const value = hours !== undefined && minutes !== undefined ? timeToString({seconds,hours,minutes},withSeconds):undefined; 
      setState({visible:false,seconds:value ? seconds:undefined,hours,minutes,value,date:value ? getDate(hours,minutes,seconds):undefined})
    };
    anchorProps = defaultObj(anchorProps);
    customRight = React.isValidElement(customRight) || typeof customRight =='function'? customRight : null;
    let right = null;
    if(withModal){
      right = (props)=>{
          return <>
              <Icon title={label}  {...anchorProps} 
              icon="clock-outline" onPress={(e)=>{
                  React.stopEventPropagation(e);
                  setState({...state,visible:true});
              }}
              {...props}
              style = {[props.style,anchorProps.style]}
              />
           {typeof customRight =='function'? customRight(props): customRight}  
          </>
      }
   } else right = customRight;
    React.useEffect(()=>{
      if(prevDefaultValue !== defaultValue){
        const s = {...state,...parseTime(defaultValue,withSeconds)};
        if(!defaultValue){
          s.hours = s.value = s.minutes = s.seconds = s.date = undefined;
        }
         setState(s)
      }
    },[defaultValue]);
    React.useEffect(()=>{
        if(compareTimeState(state,prevState,true)) return;
        const value = isNumber(state.hours) && isNumber(state.minutes)? timeToString(state,withSeconds) : undefined;
        if(onChange){
           onChange({...state,visible:undefined,value});
        }
    },[state])
    const openModal = x=>{
      setState({...state,visible:true})
    }
    const closeModal = x=>{
      setState({...state,visible:false})
    }
    containerProps = defaultObj(containerProps);
    if(!disabled){
      containerProps.style = [containerProps.style,{opacity:1}]
    }
    const iContainerProps = defaultObj(inputProps.containerProps);
    return <>
      <TouchableRipple {...containerProps} 
        disabled = {!isEditable}
        style = {[containerProps.style,styles.cursorPointer]}
        onPress = {isEditable?openModal:undefined}
        rippleColor={containerProps.rippleColor}
      >
          <TextField
          mode = {mode||theme.textFieldMode}
          {...rest}
          {...inputProps}
          containerProps = {{...iContainerProps,style:[containerProps.style,iContainerProps.style]}}
          label = {label}
          right = {right}
          disabled = {disabled}
          editable = {false}
          handleOpacity = {false}
          style = {[rest.style,!disabled && {opacity:1,color:theme.colors.text}]}
          contentContainerProps = {{...defaultObj(rest.contentContainerProps),pointerEvents:'auto'}}
          defaultValue = {state.value}
          placeholder = {formatLabel}
        />
      </TouchableRipple>
      {withModal && <TimePickerModal
          {...dialogProps}
            {...state}
            label = {label}
            onConfirm={onConfirm}
            onTimeChange = {(date)=>{
                return onConfirm({hours:date?.getHours(),minutes:date?.getMinutes()})
            }}
            onDismiss = {closeModal}
            locale={defaultStr(rest.locale,dialogProps.locale,locale)}
            uppercase = {(upper === true || upperCase === true) ? true : false}
            cancelLabel= {defaultStr(cancelLabel,"Annuler")}
            confirmLabel = {defaultStr(confirmLabel,'OK')}
            onCancel = {closeModal}
        />}
      </>
  }
  
  TimePickerComponent.propTypes = {
    ...TextField.propTypes,
    anchorProps : PropTypes.object,///les props à appliquer à l'icone de type time, permettant de sélectionner une valeur du temps
    containerProps : PropTypes.object,
    onChange: PropTypes.func,
    /*** les props du composant TimePickerModal */
    dialogProps : PropTypes.shape({
      ...defaultObj(TimePickerModal.propTypes)
    }),
    withSeconds : PropTypes.bool, //si les sécondes devrons être utilisées
  }