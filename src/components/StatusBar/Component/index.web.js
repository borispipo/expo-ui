import React from "$react";
//import { StatusBar } from 'expo-status-bar';
import theme,{getStatusBarStyle,Colors} from "$theme"
import {isTouchDevice,uniqid} from "$cutils";
import {isDOMElement,removeClassName,addClassName} from "$cutils/dom";
import { StyleSheet } from "react-native";

const styleId = uniqid("dynamic-css-style-id");

const updateStyleSheet = (theme)=>{
    if(typeof document !=="undefined" && document ){
        var wrap = document.getElementById(styleId);
        if(!wrap){
            wrap = document.createElement("div");
            document.body.appendChild(wrap);
        }
        wrap.id = styleId;
        wrap.style = {...defaultObj(StyleSheet.flatten(wrap.style)),display:'none',width:0,height:0};
        wrap.innerHTML = "";
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = getCss(theme);
        wrap.appendChild(style );
    }
}
const getCss = (theme)=>{
    return ``
}

export default function StatusBarComponent(props){
    const styles = getStatusBarStyle()
    React.useEffect(()=>{
        updateStyleSheet(theme);
        updateThemeName(theme);
        return;
        if(Colors.isValid(styles.backgroundColor)){
            if(typeof document != 'undefined' && document && document.querySelector && isTouchDevice()){
                let m = ["msapplication-navbutton-color","theme-color","apple-mobile-web-app-status-bar-style"]
                let statusBarColor = styles.backgroundColor;
                for(let i in m){    
                    let name = m[i];
                    let metaThemeColor = document.querySelector("meta[name="+name+"]");
                    if(!isDOMElement(metaThemeColor)){
                        metaThemeColor = document.createElement('meta');
                        metaThemeColor.setAttribute('name', name);
                        document.getElementsByTagName('head')[0].appendChild(metaThemeColor);
                    }
                    if(isDOMElement(metaThemeColor)){             
                        metaThemeColor.setAttribute("content", statusBarColor);
                    }
                }
            }
        }
    },[]);
    return null;
}
const updateThemeName = (theme)=>{
    if(typeof document ==="undefined" || !document || !isDOMElement(document.body)) return null;
    let b = document.body;
    let c = b.getAttribute("data-theme");
    if(c){
        removeClassName(b,'theme-'+c);
        let s = c.split('-');
        removeClassName(b,'theme-primary-'+s[0],'theme-secondary-'+s[1])
    }
    removeClassName(b,"theme-primary-text-white");
    removeClassName(b,"theme-secondary-text-white");
    removeClassName(b,"theme-secondary-white");
    if(theme.colors.primaryContrast =="white"){
        addClassName(b,"theme-primary-text-white")
    }
    if(theme.colors.secondaryContrast =="white"){
        addClassName(b,"theme-secondary-text-white")
    }
    if(theme.colors.secondaryContrast =="white"){
        addClassName(b,"theme-secondary-white");
    }
    return null;
    if(isNonNullString(theme.colors.name)){
        let s = theme.colors.name.split('-')
        let primaryColorName = defaultStr(theme.colors.primaryColorName,s[0]).replaceAll("-","_")
        let secondaryColorName = defaultStr(theme.colors.secondaryColorName,s[1]).replaceAll("-","_");
        let themeName = primaryColorName && secondaryColorName ? (primaryColorName+"-"+secondaryColorName) : theme.colors.name;
        addClassName(b,'theme-'+themeName,'theme-primary-'+primaryColorName,'theme-secondary-'+secondaryColorName);
        b.setAttribute("data-theme",themeName);
    }
}
