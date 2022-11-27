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
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import Foundation from "@expo/vector-icons/Foundation";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Zocial from "@expo/vector-icons/Zocial";

/*** @see : https://icons.expo.fyi/ popur tous les icons supportés*/
/*** L'iconSet par défaut est le MaterialCommunityIcon qui ne nécessite pas de préfixer les noms des icones
 *  Les prefix suivant doivent être utilisés : 
 *      fa - pour l'iconSet FontAweSome5
 *      ant - pour l'iconSet AntDesign
 *      fontisto - pour l'iconSet Fontisto
 *      foundation - pour l'iconSet Foundation
 *      ionic - pour l'iconSet IonicIcons
 *      octicons - pour l'iconSet Octicons
 *      simple-line - pour l'iconSet SimpleLinesIcons
 *      zocial - pour l'iconSet Zocial
 */
const FontIcon = React.forwardRef(({icon,name,testID,color,iconStyle,backgroundColor,style,...props},ref)=>{
    icon = defaultStr(icon,name).trim();
    testID = defaultStr(testID,"RN_FontIconComponent");
    const fStyle = StyleSheet.flatten(style) || {};
    color = theme.Colors.isValid(color)? color : fStyle.color || theme.colors.text;
    backgroundColor = theme.Colors.isValid(backgroundColor)? backgroundColor : fStyle.backgroundColor || 'transparent';
    const isMaterial = isIcon(name,"material");
    const isFa = isIcon(name,"fa");
    const isAnt = isIcon(name,"ant");
    const isFontisto = isIcon(name,"fontisto");
    const isFoundation = isIcon(name,"foundation");
    const isIonicons = isIcon(name,"ionic");
    const isOcticons = isIcon(name,"octicons");
    const isSimpleLineIcons = isIcon(name,"simple-line");
    const isZocial = isIcon(name,"zocial");
    let Icon = isMaterial ? MaterialIcons : 
            isFa ? FontAwesome5 :  
            isFontisto ? Fontisto : 
            isAnt ? AntDesign : 
            isFoundation ? Foundation : 
            isIonicons ? Ionicons : 
            isOcticons ? Octicons: 
            isSimpleLineIcons ? SimpleLineIcons :
            isZocial ? Zocial : 
            MaterialCommunityIcons;
    if(!icon || !Icon){
        console.warn("Icone non définie pour le composant FontIcon, icon [{0}], merci de spécifier une icone supportée par la liste du module https://github.com/expo/vector-icons/MaterialCommunityIcons".sprintf(icon),props);
        return null;
    }
    const iconName = icon.ltrim("")
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
    iconSet = iconSet.toLowerCase().trim();
    return name.startsWith(iconSet+"-") || name.startsWith(iconSet+"s"+"-") ? true : false;
}

export default theme.withStyles(FontIcon,{displayName:FontIcon.displayName,mode:'normal'});
export const fonts = [
    MaterialCommunityIcons.font,
    FontAwesome5.font,
    AntDesign.font,
    Fontisto.font,
    Foundation.font,
    Ionicons.font,
    MaterialIcons.font,
    Octicons.font,
    SimpleLineIcons.font,
    Zocial.font,
];
export const fontsNames = {};
Object.map(fonts,(f,k)=>{
    if(isObj(f)){
        for(let i in f){
            fontsNames[i] = true;
        }
    }
});

/*** chage les fonts liés à l'application
 * @param {function} filter, le filtre prenant en paramètr ele fontAsset en suite et le nom de la font en question
 * @return {Promise}
 */
export function loadFonts(filter) {
    filter = typeof filter =='function'? filter : (f,name,nameLower)=> name.toLowerCase().contains("material") ? true : false;
    return Promise.all(fonts.map(font =>  {
        if(!isObj(font)) return Promise.reject({message:'Invalid font'});
        const fontName = Object.keys(font)[0]?.toLowerCase();
        if(!isNonNullString(fontName) || !fontsNames[fontName] || !filter(font,fontName,fontName.toLowerCase)) return Promise.resolve({
            status : false,
            message : 'Font {0} introuvable'.sprintf(fontName)
        });
        return FontAsset.loadAsync(font);
    }))
 };
  