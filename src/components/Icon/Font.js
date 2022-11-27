// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import theme from "$theme";
import React from "react";
import {defaultStr,isNonNullString} from "$utils";
import PropTypes from "prop-types";
import { StyleSheet } from "react-native";
import * as FontAsset from 'expo-font';

/*** @see :  https://materialdesignicons.com/ pour les icon MaterialComunityIcons*/
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
/*** @see : https://icons.expo.fyi/ popur tous les icons supportés*/
const FontIcon = React.forwardRef(({icon,name,testID,color,iconStyle,backgroundColor,style,...props},ref)=>{
    icon = defaultStr(icon,name).trim();
    testID = defaultStr(testID,"RN_FontIconComponent");
    const fStyle = StyleSheet.flatten(style) || {};
    color = theme.Colors.isValid(color)? color : fStyle.color || theme.colors.text;
    backgroundColor = theme.Colors.isValid(backgroundColor)? backgroundColor : fStyle.backgroundColor || 'transparent';
    const isMaterial = isIcon(name,"material") || true;
    const isExpo = isIcon(name,"expo");
    let Icon = isExpo ? null : MaterialCommunityIcons;
    if(!icon || !Icon){
        console.warn("Icone non définie pour le composant FontIcon, icon [{0}], merci de spécifier une icone supportée par la liste du module https://github.com/expo/vector-icons/MaterialCommunityIcons".sprintf(icon),props);
        return null;
    }
    return <Icon {...props} 
        ref = {ref}
        testID = {testID}
        color={color}
        name = {icon}
        backgroundColor = {backgroundColor}
    />
});

FontIcon.propTypes = {
    name : PropTypes.string,
    icon : PropTypes.string,
    color : PropTypes.string,
    size : PropTypes.number,
    borderRadius : PropTypes.oneOfType([
        PropTypes.number,
    ]),
    onPress : PropTypes.func,
    direction: PropTypes.oneOf(['rtl','ltr','auto']),
    iconStyle : theme.StyleProps,

}
FontIcon.displayName = "FontIconComponent";

/*** vérfie si l'icon passé en paramètre est un icon pour l'icon set
 * @param {string} name le nom de l'icone à vérifier
 * @param {string} iconSet, le set d'icon dans lequel vérifier
 */
export const isIcon = (name,iconSet)=>{
    if(!isNonNullString(name) || !isNonNullString(iconSet)) return false;
    name = name.toLowerCase();
    iconSet = iconSet.toLowerCase().rtrim().rtrim("-");
    return name.contains(iconSet+"-") || name.contains(iconSet+"s"+"-") ? true : false;
}

export default theme.withStyles(FontIcon,{displayName:FontIcon.displayName,mode:'normal'});
export const fonts = [
    MaterialCommunityIcons.font,
];

export const fontsNames = {
    MaterialCommunityIcons:true,
}

export function loadFonts() {
    return Promise.all(fonts.map(font =>  {
        if(!isObj(font)) return Promise.reject({message:'Invalid font'});
        return FontAsset.loadAsync(font);
    }))
 };
  