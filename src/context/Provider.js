import React from "$react";
import appConfig from "$capp/config";
import {MD3LightTheme,MD3DarkTheme} from "react-native-paper";
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import {colorsAlias,Colors} from "$theme";
import {isObj,isNonNullString,defaultStr} from "$cutils";
import eMainScreens from "$escreens/mainScreens";
import {ExpoUIContext} from "./hooks";
import Login from "$eauth/Login";
import {modes} from "$ecomponents/TextField";
import {isMobileMedia} from "$cdimensions";
import { prepareScreens } from "./TableData";


/*****
    les utilitaires disponibles à passer au provider : 
    FontsIconsFilter : (font{object},fontName{string},fontNameLower{string})=><boolean> //porte le nom de la props de appConfig dans lequel définir les filtres à utiliser pour charger l'iconSet désirée pour l'appication
    ///fonction de rappel appelée avant d'exit l'application, doit retourner une promesse que lorsque résolue, exit l'application
    beforeExit : ()=><Promise>     
    getTableData : ()=>{object|array}
    getStructData : ()=>{object|array}
    tablesData : {object}, la liste des tables de données
    strucsData : {object}, la liste des données de structures
    convertFiltersToSQL : {boolean}, si les filtres de datagrid ou filtres seront convertis au format SQL
    components : {
        logo : {
            object |
            ReactNode,
            ReactComponent
        },
        loginPropsMutator : ({object})=><{object}>, la fonction permettant de muter les props du composant Login,
        tableLinkPropsMutator : ({object})=><{object}>, la fonction permettant de muter les props du composant TableLink,
        TableDataScreen | TableDataScreenItem : {ReactComponent}, le composant TableDataScreenItem, à utiliser pour le rendu des écrans
        TableDataScreenList | TableDataListScreen {ReactComponent}, le composant TableDataList à utiliser pour le rendu des écrans listants les éléments du table data
    },
    navigation : {
      screens : {Array}, les écrans de navigation,
      drawerItems : {object|array|function}, la fonction permettant d'obtenir les items du drawer principal de l'application
    }
*/
const Provider = ({children,getTableData,navigation,components,convertFiltersToSQL,getStructData,tablesData,structsData,...props})=>{
    const {extendAppTheme} = appConfig;
    const { theme : pTheme } = useMaterial3Theme();
    navigation = defaultObj(navigation);
    components = defaultObj(components);
    structsData = isObj(structsData)? structsData : null;
    appConfig.tablesData = tablesData;
    appConfig.structsData = appConfig.structsData = isObj(structsData)? structsData : null;
    getTableData = appConfig.getTable = appConfig.getTableData = getTableOrStructDataCall(tablesData,getTableData);
    getStructData = appConfig.getStructData = getTableOrStructDataCall(structsData,getStructData);
    appConfig.LoginComponent = Login;
    if(convertFiltersToSQL !== undefined){
      appConfig.set("convertFiltersToSQL",convertFiltersToSQL);
    }
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
        const r = typeof extendAppTheme == 'function'? extendAppTheme(theme)  : theme;
        const _theme = (isObj(r) ? r : theme);
        const customCSS = _theme.customCSS;
        return {
          ..._theme,
          get customCSS(){
             const prevCSS = defaultStr(typeof customCSS ==='function'? customCSS(theme) : customCSS);
             return `
                #root {
                  overflow:hidden!important;
                  width : 100%!important;
                  height : 100%important;
                  left : 0!important;
                  top : 0!important;
                }
                .virtuoso-table-component,
                .virtuoso-table-component th,
                .virtuoso-table-component tr,
                .virtuoso-table-component td{
                  border-collapse : collapse!important;
                }
                ${prevCSS}
             `;
          },
          get textFieldMode (){
            /***** possibilité de charger le mode d'affichage par défaut des champs textuels dans le theme de l'application */
            if(typeof theme.textFieldMode =='string' && theme.textFieldMode && modes[theme.textFieldMode]){
                return modes[theme.textFieldMode];
            }
            return isMobileMedia()? modes.shadow : modes.flat;
          }
        }
    }
    const {screens} = navigation;
    navigation.screens = React.useMemo(()=>{
       const r = prepareScreens({
        tables:tablesData,
        screens,
        TableDataScreen:components.TableDataScreen || components.TableDataScreenItem,
        TableDataScreenList:components.TableDataScreenList||components.TableDataListScreen
      });
      return [...r,...eMainScreens];
    },[]);
    return <ExpoUIContext.Provider 
      value={{
        ...props,
        navigation,
        convertFiltersToSQL,
        components : {
            ...components,
            loginPropsMutator : (props)=>{
               return extendProps(components.loginPropsMutator,props);
            },
            tableLinkPropsMutator : (props)=>{
                return extendProps(components.tableLinkPropsMutator,props);
            }
        },
        getTableData,
        getTable : getTableData,
        getStructData,
        tablesData,
        structsData,
        appConfig
      }} 
      children={children}
    />;
}
const getTableOrStructDataCall = (tablesOrStructDatas,getTableOrStructDataFunc)=>{
  return (tableName,...rest)=>{
      if(!isNonNullString(tableName)) return null;
      tableName = tableName.trim();
      const ret2 = typeof getTableOrStructDataFunc ==='function' ? getTableOrStructDataFunc (tableName,...rest) : null;
      if(isObj(ret2) && Object.size(ret2,true)) return ret2;
      if(!isObj(tablesOrStructDatas)) return null;
      const ret = tablesOrStructDatas[tableName] || tablesOrStructDatas[tableName.toLowerCase()] || tablesOrStructDatas[tableName.toUpperCase];
      if(isObj(ret)) return ret;
      return null;
  }
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