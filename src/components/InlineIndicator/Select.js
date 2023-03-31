import SimpleSelect from "$ecomponents/SimpleSelect";
import {flatMode} from "$ecomponents/TextField";
import { StyleSheet } from "react-native";
import React from "$react";
import {defaultObj} from "$cutils";

const InlineIndicatorSelectComponent = React.forwardRef((props,ref)=>{
    let {inputProps,style,...rest} = props;
    rest = defaultObj(rest);
    inputProps = Object.assign({},inputProps);
    inputProps.style = [styles.inputProps,inputProps.style];
    inputProps.containerProps = Object.assign({},inputProps.containerProps);
    inputProps.contentContainerProps = Object.assign({},inputProps.contentContainerProps);
    inputProps.contentContainerProps.style = [inputProps.contentContainerProps.style,styles.contentContainer];
    inputProps.outlined = false;
    inputProps.containerProps.style = [styles.inputContainer,inputProps.containerProps.style]
    inputProps.enableCopy = typeof inputProps.enableCopy =='boolean'? inputProps.enableCopy : false;
    return <SimpleSelect
        mode = {flatMode}
        underlineColor = {"transparent"}
        label = {""}
        showSearch = {false}
        {...rest}
        ref = {ref}
        inputProps = {inputProps}
        style = {[style]}
    />
})

InlineIndicatorSelectComponent.propTypes = {
    ...SimpleSelect.propTypes
}

InlineIndicatorSelectComponent.displayName = "InlineIndicatorSelectComponent";

const styles = StyleSheet.create({
    inputProps : {
        maxWidth : 80,
        alignSelf : "flex-end",
        justifyContent : 'flex-end',
        backgroundColor : "transparent",
    },
    inputContainer : {
        paddingVertical : 0,
        marginVertical : 0,
        backgroundColor : 'transparent',
    },
    contentContainer : {
        backgroundColor : 'transparent',
    },
    right : {
        alignSelf : 'flex-end',
        justifyContent : 'flex-end',
        alignItems : 'flex-end'
    },
})

export default InlineIndicatorSelectComponent;