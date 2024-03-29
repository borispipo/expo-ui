import Select from "./Select";
import LabelComponent from "$ecomponents/Label";
import React from "$react";
import {defaultObj,defaultVal} from "$cutils";
import {isMobileMedia} from "$cplatform/dimensions";
import TextFieldComponent from "$ecomponents/TextField";
import { StyleSheet } from "react-native";
import {METRICS_UNITS,WEIGHTS_UNITS} from "./utils";

export {Select};

export const PriceType = React.forwardRef((props,ref)=>{
    let {dialogProps,inputProps,defaultValue,...rest} = props;
    dialogProps = Object.assign({},dialogProps);
    dialogProps.title = defaultVal(dialogProps.title,"Type de prix : HT/TTC")
    inputProps = Object.assign({},inputProps);
    const isMob = isMobileMedia();
    inputProps.style = [styles.priceType,inputProps.style];
    rest = defaultObj(rest);
    return <Select
        withCheckedIcon = {isMob}
        {...rest}
        inputProps = {inputProps}
        compare = {(a,b)=>a && b && a.toLowerCase() === b.toLowerCase()}
        dialogProps = {dialogProps}
        defaultValue = {defaultVal(defaultValue,PriceType.defaultValue)}
        ref = {ref}
    />
});

PriceType.defaultValue = "ttc";

PriceType.displayName = "PriceTypeComponent";

PriceType.propTypes = {
    ...Select.propTypes
}

export const MetricUnit = React.forwardRef((props,ref)=>{
    let {dialogProps,inputProps,...rest} = props;
    dialogProps = Object.assign({},dialogProps);
    dialogProps.title = defaultVal(dialogProps.title,"Unité de mésure")
    inputProps = Object.assign({},inputProps);
    const isMob = isMobileMedia();
    inputProps.style = [styles.metricUnit,inputProps.style];
    rest = defaultObj(rest);
    return <Select
        items = {METRICS_UNITS}
        withCheckedIcon = {isMob}
        {...rest}
        inputProps = {inputProps}
        dialogProps = {dialogProps}
        ref = {ref}
    />
});

MetricUnit.defaultValue = "m";

MetricUnit.displayName = "MetricUnitInlineIndicatorComponent";

export const WeightUnit = React.forwardRef((props,ref)=>{
    let {dialogProps,inputProps,...rest} = props;
    dialogProps = Object.assign({},dialogProps);
    dialogProps.title = defaultVal(dialogProps.title,"Unité de poids")
    inputProps = Object.assign({},inputProps);
    const isMob = isMobileMedia();
    inputProps.style = [styles.weightUnit,inputProps.style];
    rest = defaultObj(rest);
    return <Select
        items = {WEIGHTS_UNITS}
        renderItem = {({item,index})=>index}
        withCheckedIcon = {isMob}
        {...rest}
        inputProps = {inputProps}
        dialogProps = {dialogProps}
        ref = {ref}
    />
});

WeightUnit.defaultValue = "kg";

export const TextInput = React.forwardRef((props,ref)=>{
    let {containerProps,contentContainerProps,...rest} = props;
    containerProps = Object.assign({},containerProps);
    contentContainerProps = Object.assign({},contentContainerProps);
    containerProps.style = [styles.container,containerProps.style]
    contentContainerProps.style = [styles.container,contentContainerProps.style];
    return <TextFieldComponent
        outlined = {false}
        label = ""
        {...rest}
        containerProps = {containerProps}
        contentContainerProps = {contentContainerProps}
        ref = {ref}
    />
});


export const TextField = TextInput;


WeightUnit.displayName = "WeightUnitInlineIndicatorComponent";

export const Text = React.forwardRef((props,ref)=>{
    return <LabelComponent.withRef ref={ref} {...props} style={[styles.text,props.style]}/>
});

export const Label = Text;

Text.propTypes = LabelComponent.propTypes;


const styles = StyleSheet.create({
    container : {
        paddingVertical : 0,
        flex : 1,
        backgroundColor : 'transparent',
    },
    metricUnit : {
        width : 30,
        textAlign : 'right'
    },
    priceType : {
        width:32,
    },
    weightUnit : {
        width : 30,
        textAlign : 'right',
    },
    text : {
        paddingHorizontal : 10,
    }
})