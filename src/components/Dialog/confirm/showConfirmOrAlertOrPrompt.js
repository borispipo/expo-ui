import {isDecimal,defaultObj,defaultStr,defaultVal} from "$cutils";
import Alert from "./Alert"
import theme from "$theme";
import Label from "$ecomponents/Label";
import React from "$react";
import TextField from "$ecomponents/TextField";
import {View} from "react-native";
import PropTypes from "prop-types";

export default function showConfirm (p,cb){
    let {
        yes,
        title,
        text,
        defaultValue,
        message,
        msg,
        onCancel,
        onSuccess,
        alert,
        ok,
        prompt,
        confirm,
        no,
        type,
        inputMode,
        alertType,
        actions,
        testID,
        buttons,
        messageProps,
        inputProps,
        format,
        placeholder,
        children,
        withInputField,
        ...options
    } = defaultObj(p);
    messageProps = defaultObj(messageProps);
    inputProps = defaultObj(inputProps);
    const inputValueRef = React.createRef(null);
    const inputRef = React.createRef(null);
    const setArgsValue = (args)=>{
        args.value = inputValueRef.current;
        args.inputRef = inputRef;
        args.close = Alert.close;
    }
    inputValueRef.current = defaultValue;
    if(isDecimal(text)){
        text = text+"";
    }
    title = defaultVal(title)

    if(isNonNullString(no)){
        no = {text:no}
    }
    if(isNonNullString(yes)){
        yes = {text:yes}
    }
    testID = defaultStr(testID,"RN_AlertDialogComponent");
    buttons = defaultVal(buttons,actions);
    if(buttons !== false && buttons !== null){
        if(!isArray(buttons)){
            buttons = [];
        }    
        onSuccess = defaultFunc(onSuccess,cb);
        onCancel = defaultFunc(onCancel,cb);
        if(!alert && no !== false){
            no = defaultObj(no)
            no.text  = defaultStr(no.text,'Non');
            const {onPress} = no;
            no.testID = testID+"_NoCancelButton";
            no.style = [{color:theme.colors.errorText,backgroundColor:theme.colors.error},no.style];
            no.onPress = (args)=>{
                args = React.getOnPressArgs(args);
                setArgsValue(args);
                if(onCancel(args) === false || (onPress && onPress(args) === false)) return true;
                Alert.close(args);
            }
            buttons.push(no);
        } else no = null;
        if(yes !== false){
            yes = defaultObj(yes,ok)
            yes.text = defaultStr(yes.text,alert?'OK':'Oui');
            yes.testID = testID+"_YesOkButton";
            yes.style = [{color:theme.colors.primaryText,backgroundColor:theme.colors.primary},yes.style]
            const {onPress} = yes;
            yes.onPress = (args)=>{
                args = React.getOnPressArgs(args);
                setArgsValue(args);
                if(onSuccess(args) === false || (onPress && onPress(args) === false)) return true;
                Alert.close(args);
            }
            buttons.push(yes);
        }
    } else {
        buttons = [];
    }
    message = defaultVal(message,msg)
    options = defaultObj(options);
    if(confirm){
        alert = true;
    }
    const messageContent = React.isValidElement(message,true)?<Label testID={testID+"_Message"} {...messageProps} style={[theme.styles.fs15,theme.styles.pb1,messageProps.style]} >{message}</Label> :null;
    if(alert){
        return Alert.alert({
            content : <View testID={testID}>
                {messageContent}
            </View>,
            ...options,
            title,
            actions : buttons
        });
    }
    type = defaultStr(type,"text").toLowerCase();
    const Component = type ==="select" && React.isComponent(Alert.SimpleSelect) ? Alert.SimpleSelect : TextField;
    return Alert.open({
        content : <View testID={testID}>
            {messageContent}
            {withInputField !== false ? <Component
                type = {type}
                enableCopy = {false}
                defaultValue = {defaultValue}
                placeholder = {placeholder}
                affix = {false}
                format = {format}
                {...inputProps}
                ref = {inputRef}
                onChange = {(args)=>{
                    inputValueRef.current = args.value;
                    if(typeof inputProps.onChange ==='function'){
                        inputProps.onChange(args);
                    }
                }}
            />: null}
        </View>,
        ...options,
        title,
        actions : buttons
    });
}


/**** les props de la fonction showConfirm */
showConfirm.propTypes = {
    inputProps : PropTypes.object, ///les props à passer à l'input, lorsque c'est de type prompt
    title : PropTypes.any,
    content : PropTypes.any,
    message : PropTypes.any,
    withInputField : PropTypes.bool,
}