import React from "$react";
import appConfig from "$capp/config";
import {MD3LightTheme,MD3DarkTheme} from "react-native-paper";
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import {colorsAlias,Colors} from "$theme";
import {isObj} from "$cutils";
import eMainScreens from "$escreens/mainScreens";
import {ExpoUIContext} from "./hooks";
import Login from "$eauth/Login";

/*****
    les utilitaires disponibles à passer au provider : 
    FontsIconsFilter : (font{object},fontName{string},fontNameLower{string})=><boolean> //porte le nom de la props de appConfig dans lequel définir les filtres à utiliser pour charger l'iconSet désirée pour l'appication
    ///fonction de rappel appelée avant d'exit l'application, doit retourner une promesse que lorsque résolue, exit l'application
    beforeExit : ()=><Promise>     
    getTableData : ()=>{object|array}
    getStructData : ()=>{object|array}
    tablesData : {object}, la liste des tables de données
    strucsData : {object}, la liste des données de structures
    components : {
        logo : {
            object |
            ReactNode,
            ReactComponent
        },
        loginPropsMutator : ({object})=><{object}>, la fonction permettant de muter les props du composant Login,
        tableLinkPropsMutator : ({object})=><{object}>, la fonction permettant de muter les props du composant TableLink
    },
    navigation : {
      screens : {Array}, les écrans de navigation,
      drawerItems : {object|array|function}, la fonction permettant d'obtenir les items du drawer principal de l'application
    }
*/
const Provider = ({children,getTableData,navigation,components,getStructData,tablesData,structsData,...props})=>{
    const {extendAppTheme} = appConfig;
    const { theme : pTheme } = useMaterial3Theme();
    navigation = defaultObj(navigation);
    components = defaultObj(components);
    const {screens} = navigation;
    navigation.screens = [...(Array.isArray(screens)? screens : []),...eMainScreens];
    structsData = isObj(structsData)? structsData : null;
    appConfig.tablesData = tablesData;
    appConfig.structsData = appConfig.structsData = isObj(structsData)? structsData : null;
    appConfig.getTableData = getTableData;
    appConfig.getStructData = getStructData;
    appConfig.LoginComponent = Login;
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
    return <ExpoUIContext.Provider 
      value={{
        ...props,
        navigation,
        components : {
            ...components,
            loginPropsMutator : (props)=>{
               return extendProps(components.loginPropsMutator,props);
            },
            tableLinkPropsMutator : (props)=>{
                return extendProps(components.tableLinkPropsMutator,props);
            }
        },
        getTableData,getStructData,tablesData,structsData,appConfig
      }} 
      children={children}
    />;
}

const extendProps = (cb,props)=>{
  const prs = defaultObj(props);
  const o = typeof  cb ==='function'? cb(props) : null;
  if(isObj(o)){
      return {...prs,...o};
  }
  return prs
}
export default Provider;