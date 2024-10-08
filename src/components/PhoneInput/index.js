import React from "$react";
import {defaultObj,defaultStr,isNonNullString} from "$cutils";
import TextField,{inputModes} from "$ecomponents/TextField";
import { StyleSheet,Image,Pressable} from 'react-native';
import PropTypes from "prop-types";
import theme,{DISABLED_OPACITY} from "$theme";
import {flatMode} from "$ecomponents/TextField";
import Icon from "$ecomponents/Icon";
import PhoneNumber from "./PhoneNumber";
import SelectCountry from "$ecomponents/Countries/SelectCountry";
import {getFlag} from "$ecomponents/Countries";
import appConfig from "$capp/config";

export {PhoneNumber};
export * from "./PhoneNumber";

import libPhoneNumber from 'google-libphonenumber';
const asYouTypeFormatter = libPhoneNumber.AsYouTypeFormatter;

// eslint-disable-next-line class-methods-use-this
export const format = (number, iso2) => {
    const formatter = new asYouTypeFormatter(defaultStr(iso2).toUpperCase().trim()); // eslint-disable-line new-cap
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
export const prepareState = ({defaultValue,country})=>{
    defaultValue = defaultStr(defaultValue).trim();
    country = defaultStr(country,appConfig.countryCode).toLowerCase();
    country = isNonNullString(defaultValue)? PhoneNumber.getCountryCodeOfNumber(defaultValue) || country : country;
    const countryData = country ? PhoneNumber.getCountryDataByCode(country) : null;
    const prefix = getDialCodePrefix(countryData?.dialCode);
    if (defaultValue) { 
        let defValue = defaultValue;
        if(prefix && !defaultValue.startsWith("+") && !defaultValue.startsWith(prefix)){
            defValue = prefix+defaultValue;
        }
        const displayValue = format(defValue,country);
        if(displayValue){
            return {displayValue,defaultValue,country}
        }
    } else if(prefix) {
        return {displayValue:countryData ? prefix : '',defaultValue:'',country};
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

const getValue = (text) => {
    return isNonNullString(text) ? text.replace(/[^0-9]/g, '') : defaultStr(text);
}

const getDialCodePrefix = (countryDialCode)=>{
    return isNonNullString(countryDialCode) ? `+${countryDialCode.trim().ltrim("+")}` : "";
}

export default function PhoneInputComponent(props){
    let {country,onChange,contentContainerProps,dialCodePrefix:dCodePrefix,allowZeroAfterCountryCode,testID,inputProps,selectionColor,label,error,errorText,helperText,defaultValue,text,setRef,...rest} = props;
    rest = defaultObj(rest);
    const displayDialCodePrefix = dCodePrefix != false ? true : false;
    contentContainerProps = defaultObj(contentContainerProps);
    contentContainerProps.style = [styles.inputContainer,contentContainerProps.style];
    const ref = React.useRef(null);
    const [state,setState] = React.useState({
        ...prepareState({defaultValue,country})
    });
    const [visible,setVisible] = React.useState(false);
    const prevVisible = React.usePrevious(visible);
    label = defaultVal(label,text);
    React.useEffect(()=>{
        React.setRef(ref,ref.current,setRef);
    },[])
    React.useEffect(()=>{
        const nState = prepareState({defaultValue,country:country || state.country})
        if(nState.defaultValue !== state.defaultValue && nState.country !== state.country && nState.displayValue !== state.displayValue){
            setState({...state,...nState});
        }
    },[defaultValue,country])
    const onPressFlag = (e)=>{
        if(!visible){
            setVisible(true);
        }
    }
    inputProps = defaultObj(inputProps);
    const disabledStyle = props.disabled ?{opacity:DISABLED_OPACITY}:undefined; 
    const flagImageSource = getFlag(state.country);
 
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
        const dialCodePrefix = getDialCodePrefix(countryDialCode);
        if (modifiedNumber === dialCodePrefix) {
            displayValue = modifiedNumber;
        } else {
            displayValue = format(modifiedNumber);
        }
        if(!displayDialCodePrefix){
            modifiedNumber = defaultStr(modifiedNumber).trim().ltrim(dialCodePrefix);
            displayValue = dialCodePrefix+defaultStr(displayValue).trim().ltrim(dialCodePrefix);
        }
        const nState = {
            country : iso2,
            displayValue,
            defaultValue : modifiedNumber,
            countryDialCode,
            dialCodePrefix
        }
        return nState;
    }
    const pointerEvents = props.disabled || props.readOnly ? "none":"auto";
    const isFlatMode = theme.textFieldMode === flatMode;
    testID = defaultStr(testID,"RN_PhoneInputComponent");
    return <SelectCountry
        label = {label}
        controlled = {true}
        visible = {visible}
        defaultValue = {state.country}
        testID = {testID+"_SelectCountry"}
        onDismiss = {({value},force) =>{
            if(force !== true && value === state.country && visible == prevVisible) return;
            if(visible){
                setVisible(false);
            }
        }}
        onChange = {({value})=>{
            setState({...state,...prepareState({country:value,defaultValue:state.country==value?state.defaultValue:""})});
        }}
        anchor = {
            <>
                <TextField
                    affix = {false}
                    {...rest}
                    toCase = {(val)=>{
                        return (val.startsWith("+")?"+":"")+val.replace(/[^\s0-9]/g, '');
                    }}
                    testID = {testID}
                    error = {error}
                    errorText = {state.errorText || errorText}
                    helperText = {helperText}
                    contentContainerProps = {contentContainerProps}
                    label = {label}
                    aria-label = {defaultStr(label,text)}
                    formatValue = {false}
                    disabled = {props.disabled}
                    pointerEvents = {pointerEvents}
                    left = {
                        <Pressable testID={testID+"_Left"} style={[styles.flag,{pointerEvents},disabledStyle,!isFlatMode && styles.notFlatModeFlag]}
                            disabled = {props.disabled}
                            onPress={onPressFlag}
                        >
                            <>
                                {flagImageSource ? <Image testID={testID+"_FlagImage"} source={flagImageSource} height={20} width={30} style={[styles.flagImage]} />
                                : null}
                                <Icon testID={testID+"_FlagChevronIcon"} name="chevron-down" size={16} style={[styles.flagIcon]} onPress={onPressFlag} />
                            </>
                        </Pressable>
                    }
                    inputMode ={inputModes.number}
                    defaultValue = {state.displayValue}
                    onChange = {(args)=>{
                        const {value:nValue} = args;
                        const prevState = state;
                        const nState = updateValue(nValue);
                        let value = defaultStr(nState.defaultValue).trim();
                        if(value =="+" || value =="("){
                            value = "";
                        }
                        const prevVal = defaultStr(prevState.defaultValue).trim();
                        const dialCodePrefix = getDialCodePrefix(prevState.countryDialCode) || getDialCodePrefix(state.countryDialCode);
                        if(prevVal.ltrim(dialCodePrefix) === value.ltrim(dialCodePrefix)) return;
                        const canChange = value.length < 5 || PhoneNumber.parse(nState.displayValue,nState.countryCode);
                        nState.errorText = canChange ? undefined : "Veuillez entrer un numéro de téléphone valide";
                        setState({...state,...nState});
                        if(onChange && canChange){
                            onChange({...nState,value,country:nState.country,displayValue:nState.displayValue,realValue:nState.defaultValue});
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
    dialCodePrefix : PropTypes.bool, //si le prefix du pays sera supprimée de la valeur du nombre
}