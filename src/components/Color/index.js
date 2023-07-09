import { StyleSheet,Pressable } from 'react-native'
import View from "$ecomponents/View";
import TextField,{shadowMode} from "$ecomponents/TextField";
import ColorPicker from './ColorPicker';
import theme,{Colors,DISABLED_OPACITY} from "$theme";
import PropTypes from "prop-types";
import React from "$react";
import Dialog from "$ecomponents/Dialog";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import {defaultStr,defaultObj} from "$cutils";

const ColorPickerComponent = React.forwardRef ((props,ref)=>{
    let {defaultValue,label,rippleColor,onChange,text,containerProp,disabled,readOnly,...rest} = props;
    containerProp = defaultObj(containerProp);
    disabled = defaultBool(disabled,false);
    readOnly = defaultBool(readOnly,false);
    const isEditable = !disabled && readOnly !== true ? true : false;
    const pointerEvents = isEditable ? "auto" : "none";
    const isMob = isMobileOrTabletMedia();
    const _label = defaultStr(label,text);
    const pickerRef = React.useRef(null);
    const [state,setState] = React.useState({
        color : Colors.isValid(defaultValue)? defaultValue : undefined,
        visible : false,
    })
    const color = state.color;
    const colorRef = React.useRef(state.color);
    const prevColor = React.usePrevious(state.color);
    
    const onColorChange = (color)=>{
        colorRef.current = color;
        if(props.onColorChange){
            props.onColorChange(color);
        }
    }
    const onColorChangeComplete = (color) => {
        colorRef.current = color;
        if(props.onColorChangeComplete){
            props.onColorChangeComplete(color);
        }
    }
    const openPicker = ()=>{
        if(state.visible) return;
        setState({...state,visible:true})
    }
    let textStyle = {};
    let selectionColor = undefined;
    if(color){
        textStyle.backgroundColor = color;
        selectionColor = textStyle.color = Colors.getContrast(color);
    }
    if(disabled){
        textStyle = {opacity:DISABLED_OPACITY};
    }
    const onDismiss = (e)=>{
        setState({...state,visible:false})
    }
    React.useEffect(()=>{
        if(prevColor !== color && onChange){
            onChange({value:color,previousValue:prevColor})
        }
    },[color])
    React.useEffect(()=>{
        const nColor = Colors.isValid(defaultValue)? defaultValue : "";
        if(nColor === color || (!nColor && !color)) return;
        setState({...state,color:nColor})
    },[defaultValue]);
    const mode = defaultStr(rest.mode,theme.textFieldMode)
    return <>
            <Pressable
                {...containerProp}
                role="button"
                disabled = {!isEditable}
                pointerEvents = {pointerEvents}
                accessibilityLabel={defaultStr(label,text)}
                style = {[styles.container,containerProp]}
                onPress={openPicker}
                rippleColor={rippleColor}
                opacityColor = {rippleColor}
            >
            <TextField
                enableCopy
                {...rest}
                mode = {mode}
                ref = {ref}
                label = {defaultVal(label,_label)}
                readOnly = {true}
                disabled = {disabled}
                selectionColor = {selectionColor}
                color = {selectionColor}
                defaultValue = {color}
                labelStyle = {[mode !== shadowMode && textStyle ,styles.label]}
                style = {[rest.style,{color:selectionColor,backgroundColor:selectionColor},styles.input]}
                contentContainerProps = {{style:textStyle}}
            />
        </Pressable>
        <Dialog
            visible = {state.visible}
            title = {_label+(color?("["+color+"]"):"")}
            fullScreen = {isMob}
            onDismiss = {onDismiss}
            cancelButton = {false}
            withScrollView
            actions = {[
                isMob ? undefined : {
                    text : 'annuler',
                    icon : 'close-thick',
                    onPress : onDismiss,
                    secondary : true,
                },
                {
                    text : "Selectionner",
                    icon : "check",
                    primary : true,
                    onPress : ()=>{
                        setState({...state,visible:false,color:colorRef.current});
                    }
                },
            ]}
        >
            <View style={[styles.content]}>
                <ColorPicker
                    ref={pickerRef}
                    color={color}
                    thumbSize={40}
                    disabled = {disabled}
                    readOnly = {!isEditable}
                    onColorChange={onColorChange}
                    onColorChangeComplete={onColorChangeComplete}
                />
            </View>
        </Dialog>
    </>
})

ColorPickerComponent.propTypes = {
    ...defaultObj(ColorPicker.propTypes),
    rippleColor : PropTypes.string,
    onChange : PropTypes.func//la fonction de rappel à appeler lorsque la couleur change
}

const styles = StyleSheet.create({
    container : {
      flex : 1,
    },
    content : {
        paddingVertical : 15,
        paddingHorizontal:15,
    },
    label : {backgroundColor:'transparent',top:0},
    input : {
        paddingBottom : 0,
    }
});

export default ColorPickerComponent;

ColorPickerComponent.displayName = "ColorPickerComponent";