import Button from "$ecomponents/Button";
import React from "$react";
import PropTypes from "prop-types";
import { pickDocument } from "$emedia/document";
import { StyleSheet } from "react-native";
import {isObj,isNonNullString,extendObj,defaultObj,defaultBool} from "$cutils";
import Label from "$ecomponents/Label";
import theme from "$theme";


const DocumentPickerComponent = React.forwardRef(({pickOptions,label,error,left,errorText,labelProps,containerProps,text:cText,onChange,onCancel,style,onPress,...props},ref)=>{
    const [assets,setAssets] = React.useState([]);
    label = React.isValidElement(label,true) && label || React.isValidElement(cText,true) && cText || null;
    const changedRef = React.useRef(null);
    labelProps = defaultObj(labelProps);
    containerProps = defaultObj(containerProps);
    const multiple = defaultBool(pickOptions?.multiple,props.multiple);
    const {text,tooltip} = React.useMemo(()=>{
        let text = ``,tooltip = "";
        let counter = 0;
        let breakCounter = 0;
        (Array.isArray(assets) ?assets:[assets]).map((a)=>{
            if(!isObj(a) || !isNonNullString(a.name)) return;
            tooltip+=`${tooltip?",":""}${a.name}`
            if(counter < 1){
                text+=`${text?",":""}${a.name}`
            } else {
                breakCounter++;
            }
            counter++;
        });
        return {
            text : text+(breakCounter> 0?` et ${breakCounter.formatNumber()} de plus`:""),
            tooltip,
        }
    },[assets]);
    React.useEffect(()=>{
        if(!isObj(changedRef.current)) return;
        const args = changedRef.current;
        changedRef.current = null;
        if(typeof onChange =="function"){
            onChange({...args,value:assets});
        } 
    },[assets]);
    const textColor = error? theme.colors.error : theme.colors.text;
    const textFieldMode = theme.textFieldMode;
    const borderColor = theme.colors[error?"error":"divider"];
    const isFlatMode = textFieldMode == "flat";
    const containerStyle = isFlatMode ? {} : {paddingHorizontal : 10}
    const labelColor = error ? theme.colors.error : theme.Colors.setAlpha(theme.colors.text,theme.ALPHA);
    const rStyle = isFlatMode ? {borderWidth:0,borderBottomWidth:1,borderBottomColor:borderColor} : {
        borderWidth : 1,
        borderRadius:15,
        borderColor,
    };
    const btn = <Button 
        onPress = {(...r)=>{
            if(typeof onPress =="function" && onPress(...r) === false) return;
            pickDocument(extendObj({},pickOptions,{multiple})).then((r)=>{
                r.assets = Array.isArray(r.assets)? r.assets : [];
                if(!multiple){
                    r.assets  = r.assets[0];
                }
                changedRef.current = r;
                setAssets(r.assets);
            }).catch((r)=>{
                if(typeof onCancel =="function"){
                    onCancel(r);
                }
            });
        }}
        left = {(props)=>{
            const c = typeof left =="function"? left(props) : React.isValidElement(left)? left : null;
            const lL = <Label children={`Choisir ${multiple ? "des fichiers":"un fichier" }`} style={[styles.leftLabel,{color:textColor,borderRightColor:theme.colors.divider}]}/>;
            return React.isValidElement(c)? <>
                {c}{lL}
            </> : lL;
        }}
        style = {[styles.button,style]}
        upperCase ={false}
        ref={ref} {...props}
        children = {text || "Aucun fichier choisit"}
        tooltip = {tooltip}
        title = {tooltip}
        labelProps = {{style:styles.label,splitText:true,numberOfLines : 1,color:textColor}}
        containerProps = {{...containerProps,style:[styles.container,containerStyle,rStyle,containerProps.style]}}
    />;
    return  <>
        {label?<Label {...labelProps} style={[{color:labelColor},labelProps.style]} children={label}/> : null}
        {btn}
        {errorText? <Label error children={errorText}/>:null}
    </> 
});

DocumentPickerComponent.displayName = "DocumentPickerComponent";

export default DocumentPickerComponent;

const styles = StyleSheet.create({
    button : {
        alignSelf: 'flex-start',
    },
    leftLabel : {
        paddingVertical : 12,
        borderRightWidth : 1,
        textWrap : "nowrap",
        paddingRight : 7,
    },
    label : {
        paddingHorizontal : 5,
        textWrap : "wrap",
        textAlign : "left",
    },
    container : {
        marginTop : 5,
    }
});

DocumentPickerComponent.propTypes = {
    label : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
        PropTypes.string,
        PropTypes.number,
    ]),
    text : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
        PropTypes.string,
        PropTypes.number,
    ]),
    ...Object.assign({},Button.propTypes),
    onChange : PropTypes.func,
    onCancel : PropTypes.func,
    /*** @see : https://docs.expo.dev/versions/latest/sdk/document-picker/#documentpickeroptions */
    pickOptions : PropTypes.shape({
        copyToCacheDirectory : PropTypes.bool,
        multiple : PropTypes.bool,
        /*** @seee : https://en.wikipedia.org/wiki/Media_type */
        type : PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string),
        ])
    }),
}