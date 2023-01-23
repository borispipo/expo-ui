import React from '$react'

import {useInputFormat,compareTwoDates,locale as defaultLocale,toDateObj} from "../utils";
import TextInputWithMask from './TextInputMask'
import {useTheme } from 'react-native-paper'
import i18n from "$i18n";
import {defaultStr} from "$utils";
import DateLib from "$lib/date";
import PropTypes from "prop-types";
import TextField from "$ecomponents/TextField";
import Icon from "$ecomponents/Icon";
import {StyleSheet,View} from "react-native";
import DatePickerModal from '../DatePickerModal'
import PeriodActionComponent from "../PeriodAction";

const validMinDate = (date,minDate)=>{
   if(!minDate || !date) return true;
   return date.withoutTime() >= minDate.withoutTime();
}
const validMaxDate = (date,maxDate)=>{
  if(!maxDate || !date) return true;
  return maxDate.withoutTime() >= date.withoutTime();
}
const DatePickerInput = React.forwardRef(({
    label,
    defaultValue,
    onChange,
    locale,
    inputMode,
    errorText,
    minimumDate,
    minDate,
    maxDate,
    maximumDate,
    withModal = true,
    withDateFormatInLabel = true,
    right:customRight,
    left : customLeft,
    helperText,
    format,
    disabled,readOnly,editable
    ,text,
    withLabel,
    style,
    anchorProps,
    render_filter,
    isPeriodAction,
    isFilter,
    calendarIconBefore = false, //si l'icone calendar sera en position left où non
    ...rest
  },ref)=>{
    let right = customRight,left = customLeft, isIconLeft = calendarIconBefore;
    if(!isPeriodAction){
        isPeriodAction = isNonNullString(defaultValue) && defaultValue.contains("=>");
    }
    if(isPeriodAction){
      return <PeriodActionComponent
          {...rest}
          style = {style}
          left = {left}
          defaultValue = {defaultValue}
          right = {right}
      />
  }
  inputMode = defaultStr(inputMode,"start");
  locale = defaultStr(locale,defaultLocale);
  const theme = useTheme()
  const [state,setState] = React.useState({
    errorText : null,
    inputDate : toDateObj(defaultValue,format),
    visible : false
  })
  const inputFormat = useInputFormat(locale)
  const inputFormatLabel = i18n.lang(inputFormat);
  const prevInputDate = React.usePrevious(state.inputDate,compareTwoDates)
  const formattedValue = !state.inputDate ? undefined : DateLib.format(state.inputDate,inputFormat.toLowerCase());
  const onDismiss = () => {
    setState({...state,visible:false});
  }

  minDate = defaultVal(minDate,minimumDate);
  maxDate = defaultVal(maxDate,maximumDate);
  if(maxDate){
     maxDate = toDateObj(maxDate);
     maxDate = maxDate && DateLib.isDateObj(maxDate)? maxDate : undefined;
  }
  if(minDate){
     minDate = toDateObj(minDate);
      minDate = minDate && DateLib.isDateObj(minDate)? minDate : undefined;
  }
  

  const isEditable = disabled !== true && readOnly !== true && editable !== false?true : false;
  withModal = defaultBool(withModal,true);
  if(!isEditable){
      withModal = false;
  }
  const validateDate = (date)=>{
    let errorText = null,error = false;
    let lowerInput = inputFormat.toLowerCase();
    const dFormat = DateLib.format(date,lowerInput);
    if(!validMinDate(date,minDate)){
       errorText = "la date ["+dFormat+"] doit être plus récente que la date minimale ["+DateLib.format(minDate,lowerInput)+"]";
       error = true;
    }
    if(!validMaxDate(date,maxDate)){
        errorText = "la date ["+dFormat+"] doit être moins ancienne que la date maximale ["+DateLib.format(maxDate,lowerInput)+"]";
        error = true;
    }
    return {error,errorText};
  }
  React.useEffect(()=>{
    const inputDate = toDateObj(defaultValue);
    if(compareTwoDates(inputDate,prevInputDate)) return;
    setState({...state,inputDate});
  },[defaultValue])
  const setEmptyValue = ()=>{
    setState({...state,inputDate:undefined});
  }
 

    rest = defaultObj(rest);
  anchorProps = defaultObj(anchorProps);
  label = defaultStr(label,text);
  customRight = React.isValidElement(customRight) || typeof customRight =='function'? customRight : null;
  if(withModal){
      const customLOrR = isIconLeft ? customLeft : customRight;
      const leftOrRight = (props)=>{
        let c = typeof customLOrR =='function'? customLOrR(props): customLOrR;
        c = React.isValidElement(c)? c : null;
        return <>
            {isIconLeft ? c : null}
            <Icon
            {...anchorProps}
            {...props}
            icon="calendar"
            style = {[anchorProps.style,right?styles.noPadding:null,props.style]}
            onPress={() => {
              setState({...state,visible:true});
            }}
            hasTVPreferredFocus={undefined}
            tvParallaxProperties={undefined}
          />
          {!isIconLeft ? c : null}
        </>
      }
      if(isIconLeft){
         left = leftOrRight;
      } else {
        right = leftOrRight;
      }
  }
  const onConfirm = (date,updateVisibility) => {
    const vDate = validateDate(date);
    const inputDate = !vDate.error ? date : state.inputDate;
    let visible = state.visible;
    if(updateVisibility !== false){
        visible = false;
    }
    setState(({...state,visible,inputDate,errorText:vDate.errorText}));
 }
  const hasError = errorText || state.errorText ? true : false;
  React.useEffect(()=>{
    if(compareTwoDates(state.inputDate,prevInputDate) || state.errorText) return;
    if(onChange){
        const date = state.inputDate ? DateLib.toSQLDate(state.inputDate): undefined;
        onChange({dateObject:state.inputDate,date:state.inputDate,sqlDate:date,value:date})
    }
  },[state])
  const labelText = withLabel === false ? null: (render_filter ? label : getLabel({ label, inputFormat:inputFormatLabel, withDateFormatInLabel }));
  return (
    <>
        <TextField
          affix = {false}
          {...rest}
          style = {[styles.input,style]}
          editable = {isEditable}
          disabled = {disabled}
          left = {left}
          right = {right}
          pointerEvents = {isEditable?"auto":"none"}
          ref={ref}
          label={labelText}
          defaultValue={formattedValue}
          placeholder={inputFormatLabel}
          keyboardType={'number-pad'}
          mask={inputFormat}
          keyboardAppearance={theme.dark ? 'dark' : 'default'}
          error={hasError}
          helperText = {state.errorText || errorText}
          render = {(inputProps)=>{
              return <TextInputWithMask
                {...inputProps}
                locale = {locale}
                placeholder={inputFormatLabel}
                value = {formattedValue}
                style = {[inputProps.style,styles.input,style]}
                onChangeText={(date) => {
                  if(!date){
                    return setEmptyValue();
                  }
                  const dayIndex = inputFormat.indexOf('DD')
                  const monthIndex = inputFormat.indexOf('MM')
                  const yearIndex = inputFormat.indexOf('YYYY')
              
                  const day = Number(date.slice(dayIndex, dayIndex + 2))
                  const year = Number(date.slice(yearIndex, yearIndex + 4))
                  const month = Number(date.slice(monthIndex, monthIndex + 2))
              
                  if (Number.isNaN(day) || Number.isNaN(year) || Number.isNaN(month)) {
                    setState({...state,errorText:i18n.lang('notAccordingToDateFormat',undefined,locale)(inputFormat)})
                    return
                  }
                  const inputDate = inputMode === 'end'
                      ? new Date(year, month - 1, day, 23, 59, 59)
                      : new Date(year, month - 1, day)
                    onConfirm(inputDate,false)
                }}
              />
          }}
        />
      {withModal ? (
        <DatePickerModal
          date={state.inputDate}
          visible={state.visible}
          mode="single"
          startDate = {minDate}
          endDate = {maxDate}
          validRange={{
           startDate : minDate,  // optional
           endDate : maxDate, // optional
            //   disabledDates: [new Date()] // optional
          }}
          onDismiss={onDismiss}
          onDateChange = {(date)=>{
             onConfirm(date);
          }}
          onConfirm={({ date }) => {
             onConfirm(date);
          }}
          onCancel = {onDismiss}
          locale={locale}
          dateMode={inputMode}
        />
      ) : null}
    </>
  )
});

function getLabel({
  withDateFormatInLabel,inputFormat,label}) {
  inputFormat = i18n.lang(inputFormat);
  if (withDateFormatInLabel) {
    return label ? `${label} (${inputFormat})` : inputFormat
  }
  return label || ''
}


export default DatePickerInput;

DatePickerInput.displayName = "DatePickerInput";

const styles = StyleSheet.create({
  container : {
    position: 'relative',
    //flexGrow: 1,
    //flex:1,
  },
  noPadding : {
    paddingHorizontal : 0,
    marginHorizontal:0,
  },
  input : {
    paddingVertical : 0,
    width : '100%'
  }
})
DatePickerInput.propTypes = {
  onChange : PropTypes.func,
  anchorProps : PropTypes.object,///les props à appliquer à l'icone date permettant de sélectionner la date 
  calendarIconBefore : PropTypes.bool,///la position de l'icone calendrier pour la sélection de la date
}