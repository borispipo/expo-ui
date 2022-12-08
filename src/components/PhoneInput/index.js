import React from "$react";
import {defaultObj,defaultStr,isNonNullString} from "$utils";
import TextField from "$ecomponents/TextField";
import { StyleSheet,Image,TouchableOpacity} from 'react-native';
import PropTypes from "prop-types";
import theme,{DISABLED_OPACITY} from "$theme";
import {keyboardTypes,flatMode} from "$ecomponents/TextField";
import Icon from "$ecomponents/Icon";
import PhoneNumber from "./PhoneNumber";
import SelectCountry from "$ecomponents/Countries/SelectCountry";
import {getFlag} from "$ecomponents/Countries";

import libPhoneNumber from 'google-libphonenumber';
const asYouTypeFormatter = libPhoneNumber.AsYouTypeFormatter;

// eslint-disable-next-line class-methods-use-this
export const format = (number, iso2) => {
    const formatter = new asYouTypeFormatter(iso2); // eslint-disable-line new-cap
    let formatted;
    number.replace(/-/g, '')
        .replace(/ /g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .split('')
        .forEach((n) => {
            formatted = formatter.inputDigit(n);
        });

    return formatted;
}
const prepareState = ({defaultValue,country})=>{
    defaultValue = defaultStr(defaultValue);
    country = defaultStr(country);
    if (defaultValue) {
        if (defaultValue[0] !== '+') {
            defaultValue = `+${defaultValue}`;
        }
        country = PhoneNumber.getCountryCodeOfNumber(defaultValue);
        const displayValue = format(defaultValue,country);
        if(displayValue){
            return {displayValue,defaultValue,country}
        }
    } else if(country) {
        const countryData = PhoneNumber.getCountryDataByCode(country);
        return {displayValue:countryData ? `+${countryData.dialCode}` : '',defaultValue:'',country};
    }
    return {defaultValue:'',displayValue:'',country:''};
}

const  possiblyEliminateZeroAfterCountryCode = (number) => {
    if(!isNonNullString(number)) return "";
    const dialCode = PhoneNumber.getDialCode(number);
    return number.startsWith(`${dialCode}0`)
        ? dialCode + number.substr(dialCode.length + 1)
        : number;
}

export default function PhoneInputComponent(props){
    let {country,onChange,contentContainerProps,allowZeroAfterCountryCode,testID,inputProps,selectionColor,label,error,errorText,helperText,defaultValue,text,setRef,...rest} = props;
    rest = defaultObj(rest);
    contentContainerProps = defaultObj(contentContainerProps);
    contentContainerProps.style = [styles.inputContainer,contentContainerProps.style];
    const ref = React.useRef(null);
    const [state,setState] = React.useStateIfMounted({
        visible : false,
        ...prepareState({defaultValue,country})
    })
    const prevVisible = React.usePrevious(state.visible);
    label = defaultVal(label,text);
    React.useEffect(()=>{
        React.setRef(ref,ref.current,setRef);
        setState({...state})
    },[])
    React.useEffect(()=>{
        const nState = prepareState({defaultValue,country});
        if(nState.defaultValue !== state.defaultValue && nState.country !== state.country){
            setState({...state,...nState});
        }
    },[defaultValue,country])
    const onPressFlag = (e)=>{
        if(!state.visible){
            setState({...state,visible:true})
        }
    }
    inputProps = defaultObj(inputProps);
    const disabledStyle = props.disabled ?{opacity:DISABLED_OPACITY}:undefined; 
    const flagImageSource = getFlag(state.country);
    const getValue = (text) => {
        return isNonNullString(text) ? text.replace(/[^0-9]/g, '') : defaultStr(state.defaultValue);
    }
    
    const updateValue = (number) => {
        let modifiedNumber = getValue(number);

        if (modifiedNumber[0] !== '+' && number.length) {
            modifiedNumber = `+${modifiedNumber}`;
        }
        modifiedNumber = allowZeroAfterCountryCode
            ? modifiedNumber
            : possiblyEliminateZeroAfterCountryCode(modifiedNumber);
        const iso2 = PhoneNumber.getCountryCodeOfNumber(modifiedNumber);
    
        let countryDialCode;
        if (iso2) {
            const countryData = PhoneNumber.getCountryDataByCode(iso2);
            countryDialCode = countryData.dialCode;
        }
    
        let displayValue;
        if (modifiedNumber === `+${countryDialCode}`) {
            displayValue = modifiedNumber;
        } else {
            displayValue = format(modifiedNumber);
        }
        const nState = {
            country : iso2,
            displayValue,
            defaultValue : modifiedNumber,
        }
        setState(nState);
        return nState;
    }
    const pointerEvents = props.disabled || props.editable === false || props.readOnly ? "none":"auto";
    const isFlatMode = theme.textFieldMode === flatMode;
    testID = defaultStr(testID,"RN_PhoneInputComponent");
    return <SelectCountry
        label = {label}
        controlled = {true}
        visible = {state.visible}
        defaultValue = {state.country}
        testID = {testID+"_SelectCountry"}
        onDismiss = {({value},force) =>{
            if(force !== true && value === state.country && state.visible == prevVisible) return;
            setState({...state,...prepareState({country:value,defaultValue:state.country==value?state.defaultValue:""}),visible:false})
        }}
        anchor = {
            <>
                <TextField
                    {...rest}
                    testID = {testID}
                    error = {error}
                    errorText = {errorText}
                    helperText = {helperText}
                    contentContainerProps = {contentContainerProps}
                    label = {label}
                    accessibilityLabel = {defaultStr(label,text)}
                    formatValue = {false}
                    disabled = {props.disabled}
                    pointerEvents = {pointerEvents}
                    left = {
                        <TouchableOpacity testID={testID+"_Left"} style={[styles.flag,disabledStyle,!isFlatMode && styles.notFlatModeFlag]}
                            accessibilityRole="button"
                            disabled = {props.disabled}
                            pointerEvents = {pointerEvents}
                            onPress={onPressFlag}
                        >
                            <>
                                {flagImageSource && <Image testID={testID+"_FlagImage"} source={flagImageSource} height={20} width={30} style={[styles.flagImage]} />}
                                <Icon testID={testID+"_FlagChevronIcon"} name="chevron-down" size={16} style={[styles.flagIcon]} onPress={onPressFlag} />
                            </>
                        </TouchableOpacity>
                    }
                    keyboardType ={keyboardTypes.number}
                    defaultValue = {state.displayValue}
                    onChange = {({value:nValue})=>{
                        const prevState = state;
                        const nState = updateValue(nValue);
                        if(prevState.defaultValue === nState.defaultValue || (prevState.defaultValue.length <= 3 && nState.defaultValue.length <= 3)) return;
                            let value = nState.displayValue;
                            if(value.length <=3){
                                value = "";
                            }
                            if(prevState.defaultValue === value) return;
                            if(onChange){
                                onChange({value,country:nState.country,displayValue:nState.displayValue,realValue:nState.defaultValue})
                            }
                    }}
                    ref = {ref}
                    style = {[props.style,inputProps.style,disabledStyle]}
                />
            </>
        }
    />
}

const styles = StyleSheet.create({
    notFlatModeFlag : {
        marginLeft : 7,
    },
    flagImage : {
        borderWidth:0,
        width : 30,
        height : 20,
        marginLeft : 10
    },
    flagIcon : {
        marginRight : 4,
        marginLeft : -3
    },
    flag : {
        width : 50,
        flexDirection : "row",
        alignItems : 'center',
        justifyContent : 'center'
    },
    inputContainer : {
        paddingVertical : 5,
        paddingHorizontal : 0,
    }
})

PhoneInputComponent.propTypes = {
    onChange : PropTypes.func,
    autoFormat : PropTypes.bool, //si le texte de telephone sera formatté automatiquement
    allowZeroAfterCountryCode : PropTypes.bool,
}