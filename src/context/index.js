import React from "$react";
import appConfig from "$capp/config";
import {MD3LightTheme,MD3DarkTheme} from "react-native-paper";
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import {colorsAlias,Colors} from "$theme";
import {isObj} from "$cutils";

const ExpoUIContext = React.createContext(null);


export const useExpoUI = ()=> React.useContext(ExpoUIContext);


/*****
    les utilitaires disponibles à passer au provider : 
    FontsIconsFilter : (font{object},fontName{string},fontNameLower{string})=><boolean> //porte le nom de la props de appConfig dans lequel définir les filtres à utiliser pour charger l'iconSet désirée pour l'appication
    ///fonction de rappel appelée avant d'exit l'application, doit retourner une promesse que lorsque résolue, exit l'application
    beforeExit : ()=><Promise>     
    getTableData : ()=>{object|array}
    getStructData : ()=>{object|array}
    tablesData : {object}, la liste des tables de données
    strucsData : {object}, la liste des données de structures
*/
export const Provider = ({children,getTableData,getStructData,tablesData,structsData,...props})=>{
    const {extendAppTheme,structsData,getTableData} = appConfig;
    const { theme : pTheme } = useMaterial3Theme();
    structsData = isObj(structsData)? structsData : null;
    tablesData = isObj(tablesData) ? tablesData : null;
    if(!isObj(appConfig.tablesData)){
      appConfig.tablesData = tablesData;
    }
    if(!isObj(appConfig.structsData)){
       appConfig.structsData = structsData;
    }
    
    appConfig.getTableData = getTableData = typeof getTableData =='function'? getTableData : undefined;
    appConfig.getStructData = getStructData =  typeof getStructData =='function' ? getStructData : undefined;
    //const colorScheme = useColorScheme();
    appConfig.extendAppTheme = (theme)=>{
        if(!isObj(theme)) return;
        const newTheme = theme.dark || theme.isDark ? { ...MD3DarkTheme, colors: pTheme.dark } : { ...MD3LightTheme, colors: pTheme.light };
        for(let i in newTheme){
          if(i !== 'colors' && !(i in theme)){
            theme[i] = newTheme[i];
          }
        }
        if(isObj(theme.colors)){
          colorsAlias.map((color)=>{
            color = color.trim();
            const cUpper = color.ucFirst();
            //math theme colors to material desgin V3
            const textA = `${color}Text`,onColor=`on${cUpper}`//,containerA = `${color}Container`,onColorContainer=`on${cUpper}Container`;
            const c = Colors.isValid(theme.colors[onColor])? theme.colors[onColor] : (theme.colors[textA]) || undefined;
            if(c){
              theme.colors[onColor] = c;
            }
          });
          for(let i in newTheme.colors){
            if(!(i in theme.colors)){
              theme.colors[i] = newTheme.colors[i];
            }
          }
        }
        theme.fonts = newTheme.fonts;
        return typeof extendAppTheme == 'function'? extendAppTheme(theme)  : theme;
    }
    return <ExpoUIContext.Provider value={{...props,getTableData,getStructData,tablesData,structsData,appConfig}} children={children}/>;
}

export default useExpoUI;

export const useContext = useExpoUI;

export const useApp = useContext;