import PropTypes from "prop-types";
import {defaultVal,defaultStr,defaultBool,isDecimal,isObj,defaultObj,isNonNullString} from "$cutils";
import View from "$ecomponents/View";
import {Text} from "react-native-paper";
import { StyleSheet } from "react-native";
import theme,{Colors,DISABLED_OPACITY,ALPHA,styles} from "$theme";
import React from "react";
import {canTextBeSelectable} from "$cplatform/utils";
const defaultSelectable = canTextBeSelectable();

export const EllipsizeMode = {'head':'head','middle':'middle', 'tail':'tail' , 'clip':'clip'}

const LabelComponent = React.forwardRef(({ children,selectable,role,color,upperCase,fontSize,testID,wrap,id,wrapText,error,underlined,splitText,secondary,primary,bold,textBold,disabled,text,style,...rest},ref)=> {
    children = defaultVal(children,text);
    let isText = false;
    if(!React.isValidElement(children) && Array.isArray(children) && children.length){
        for(let i in children){
            if(typeof children[i] =='string' || typeof children =='number'){
                isText = true;
                break;
            }
        }
    }
    wrap = typeof wrap ==='boolean'? wrap : typeof wrapText ==='boolean' ? wrapText : false;

    if(!children || typeof children =='number'){
        children = isDecimal(children)? children+"" : isDecimal(text)? text+"" : undefined;
    }
    if(!children) return null;
    rest = defaultObj(rest);
    const r1 = {},r2={};
    bold = defaultBool(bold,textBold,false);
    r2.color = Colors.setAlpha(theme.colors.text,theme.ALPHA);
    if(disabled){
        r1.opacity = DISABLED_OPACITY;
    }
    if(underlined){
        r1.textDecorationLine = 'underline';
    }
    if(Colors.isValid(color)){
        r1.color = color;
    }
    
    style = Object.assign({},StyleSheet.flatten(style));
    let hasP = Object.size(style,true);
    testID = defaultStr(testID,"RN_LabelComponent");
    const restProps = {id};
    if(splitText){
        restProps.numberOfLines = defaultNumber(restProps.numberOfLines,1);
        restProps.ellipsizeMode = defaultStr(restProps.ellipsizeMode,'tail');
        if(restProps.numberOfLines > 1 && typeof wrap !=='boolean'){
            wrap = true;
        }
    }
    if(wrap){
        r1.flexWrap = "wrap";
    }
    if(disabled){
        r1.pointerEvents = "none";
    }
    selectable = selectable === false || defaultSelectable === false ? false : true;
    r2.userSelect = !selectable?"none":"all";
    if(isNonNullString(children) || isText || typeof children ==='number'){
        if(!isText){
            children +="";
            if(upperCase){
                children = children.toUpperCase();
            }
        }
        if(fontSize){
            r1.fontSize = fontSize;
        }
        if(selectable){
            r2.userSelect = "text";
        }
        return (<Text  allowFontScaling = {true} ref = {ref} 
            {...rest} {...restProps} testID={testID} disabled={disabled} 
            role={typeof role =='string' && role && supportedRoles.includes(role.trim()) && role.trim() || undefined}
            style={[styles.label,splitText?styles.wrap:null,splitText?styles.w100:null,bold?styles.bold:null,r2,style,r1,styles.webFontFamilly]}>{children}</Text>)
    }
    if(isObj(rest)){
        for(let i in rest){
            if(rest[i]!== undefined) {
                hasP = true;
                break;
            }
        }
    }
    if(children == undefined){
        return null;
    }
    const viewStyle = [bold?styles.bold:null,r2,style,r1];
    if(React.isValidElement(children)){
        if(!hasP) {
            if(id || ref){
                return <View ref = {ref} testID = {testID} id={id} style={viewStyle}>{children}</View>
            }
            return children;
        }
        return <View ref = {ref}  {...rest} {...restProps} testID = {testID} style={viewStyle} disabled={disabled}>{children}</View>
    }
    return null;
})
LabelComponent.displayName = 'LabelComponent';


const LabelComponentExported = theme.withStyles(LabelComponent);

LabelComponentExported.propTypes = {
    children : PropTypes.any,
    upperCase: PropTypes.bool,///si la transformation sera en majuscule
    text : PropTypes.any,
    fontSize : PropTypes.number,
    wrap : PropTypes.bool, //si le texte sera splité vers la ligne suivantes
    wrapText : PropTypes.bool,///alias à wrap
    primary : PropTypes.bool,
    error : PropTypes.bool,///si le label est liée à une text field sur laquelle il  y a erreur
    secondary : PropTypes.bool,
    color : PropTypes.string,
    selectable : PropTypes.bool, //si le texte est sélectionnable
    underlined : PropTypes.bool,//si le style underlined sera appliqué au label
    splitText : PropTypes.bool,///si le texte lorsqu'il est long sera splité,
    /*useSelect : PropTypes.oneOfType([
        'auto', 'text', 'none', 'contain', 'all'
    ])*/
}

export default LabelComponentExported;

LabelComponentExported.withRef = React.forwardRef((props,ref)=>{
    const [state,setState] = React.useState({
        children : props.children,
    });
    const context = {
        update : (props)=>{
            if(React.isValidElement(props,true)){
                return setState({...state,children:props})
            } else if(isObj(props)){
                return setState({...state,...props})
            }
        }
    }
    React.useEffect(()=>{
        setState({...state,children:props.children})
    },[props.children]);
    React.setRef(ref,context);
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[]);
    return <LabelComponent {...props} {...state} style={[props.style,state.style]}/>
})

LabelComponentExported.withRef.displayName = "LabelComponent.Dynamic";

LabelComponentExported.WithRef = LabelComponentExported.withRef;


export const supportedRoles = ["alert","alertdialog","application","article","banner","button","cell","checkbox","columnheader","combobox","complementary","contentinfo","definition","dialog","directory","document","feed","figure","form","grid","group","heading","img","link","list","listitem","log","main","marquee","math","menu","menubar","menuitem","meter","navigation","none","note","option","presentation","progressbar","radio","radiogroup","region","row","rowgroup","rowheader","scrollbar","searchbox","separator","slider","spinbutton","status","summary","switch","tab","table","tablist","tabpanel","term","timer","toolbar","tooltip","tree","treegrid","treeitem"];