// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import theme from "$theme";
import React from "react";
import {defaultStr,isNonNullString} from "$cutils";
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
const FontIcon = React.forwardRef(({icon,name,testID,color,iconColor,iconStyle,backgroundColor,style,...props},ref)=>{
    icon = defaultStr(icon,name).trim();
    testID = defaultStr(testID,"RN_FontIconComponent");
    const fStyle = StyleSheet.flatten(style) || {};
    color = theme.Colors.isValid(color)? color : Colors.isValid(iconColor)?iconColor : fStyle.color || theme.colors.text;
    backgroundColor = theme.Colors.isValid(backgroundColor)? backgroundColor : fStyle.backgroundColor || 'transparent';
    let Icon = MaterialCommunityIcons,iconSetName = "";
    for(let i in IconsSetsByPrefix){
        if(isIcon(name,i)){
            iconSetName = i;
            Icon = fontsObjects[IconsSetsByPrefix[i]] || Icon;
            break;
        }
    }
    if(!icon || !Icon){
        console.warn("Icone non définie pour le composant FontIcon, icon [{0}], merci de spécifier une icone supportée par la liste du module https://github.com/expo/vector-icons/MaterialCommunityIcons".sprintf(icon),props);
        return null;
    }
    const iconName = icon.trim().ltrim(iconSetName+"-").ltrim("-").trim();
    return <Icon {...props} 
        ref = {ref}
        testID = {testID}
        color={color}
        iconColor = {iconColor}
        name = {iconName}
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
    return name.startsWith(iconSet+"-") /*|| name.startsWith(iconSet+"s"+"-")*/ ? true : false;
}

export default theme.withStyles(FontIcon,{displayName:FontIcon.displayName,mode:'normal'});

export const fontsObjects = {
    MaterialCommunityIcons,
    FontAwesome5,
    AntDesign,
    Fontisto,
    Foundation,
    Ionicons,
    MaterialIcons,
    Octicons,
    SimpleLineIcons,
    Zocial,
}
export const fonts = Object.values(fontsObjects).map(f=>f.font);
export const fontsByIndex = Object.keys(fontsObjects);

/*** les prefix des icons sets */
export const IconsSetsByPrefix = {
    material : "MaterialIcons",
    fa : "FontAwesome5",
    ant : "AntDesign",
    foundation : "Foundation",
    fontisto : "Fontisto",
    ionic : "Ionicons",
    octicons : "Octicons",
    'simple-line' : "SimpleLineIcons",
    zocial : "Zocial",
}
export const IconsSetNamesToPrefix = {};
Object.keys(IconsSetsByPrefix).map((k)=>{
    IconsSetNamesToPrefix[IconsSetsByPrefix[k]] = k;
})
export const loadedIconsSetsNames = [];

/*** chage les fonts liés à l'application
 * @param {function} filter, le filtre prenant en paramètr ele fontAsset en suite et le nom de la font en question
 * @return {Promise}
 */
export function loadFonts(filter) {
    filter = typeof filter =='function'? filter : (f,name,nameLower)=> name.toLowerCase().contains("material") ? true : false;
    return Promise.all(fonts.map((font,index) =>  {
        if(!isObj(font)) return Promise.reject({message:'Invalid font'});
        const iconSetName = fontsByIndex[index];
        const fontName = Object.keys(font)[0]?.toLowerCase();
        const iconSetNameLower = iconSetName.toLocaleLowerCase();
        if(!isNonNullString(fontName) || (!iconSetNameLower.toLowerCase().contains("material") && !filter(font,iconSetName,iconSetNameLower))) return Promise.resolve({
            status : false,
            message : 'Font {0} introuvable'.sprintf(fontName)
        });
        return FontAsset.loadAsync(font).then((f)=>{
            loadedIconsSetsNames.push(iconSetName);
            return f;
        });
    }));
 };
 
 /*** retourne la liste des icones qui ont été chargées par l'application */
 export const getLoadedIconsSets = ()=>{
    const loadedIconsSets = {};
    loadedIconsSetsNames.map((iconSetName)=>{
        loadedIconsSets[iconSetName] = {
            prefix : IconsSetNamesToPrefix[iconSetName] || '',
            iconSetName,
            icons : isObj(fontsObjects[iconSetName]?.glyphMap)? Object.keys(fontsObjects[iconSetName]?.glyphMap) : []
        };
    });
    return loadedIconsSets
 }
  
  export const getLoadedFonts = x=> loadedFontsRef.current;