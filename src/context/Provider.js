import React from "$react";
import appConfig from "$capp/config";
import {MD3LightTheme,MD3DarkTheme} from "react-native-paper";
import { useMaterial3Theme,isDynamicThemeSupported} from '@pchmn/expo-material3-theme';
import { useColorScheme } from 'react-native';
import {colorsAlias,Colors} from "$theme";
import {isObj,isNonNullString,defaultStr,extendObj,defaultNumber} from "$cutils";
import {getMainScreens} from "$escreens/mainScreens";
import {ExpoUIContext} from "./hooks";
import {enableAuth,disableAuth} from "$cauth/perms";
import Login from "$eauth/Login";
import {modes} from "$ecomponents/TextField";
import {isMobileMedia} from "$cdimensions";
import { prepareScreens } from "./TableData";
import {extendFormFields} from "$ecomponents/Form/Fields";
import {AuthProvider} from '$cauth';
import { signInRef } from "$cauth/authSignIn2SignOut";
import APP from "$capp/instance";
import { AppState } from 'react-native'
import {canFetchOffline} from "$capi/utils";
import { SWR_REFRESH_TIMEOUT } from "./utils";
import * as Utils from "$cutils";
import {setDeviceIdRef} from "$capp";
import {isMobileNative} from "$cplatform";
import notify from "$cnotify";
import {showPrompt} from "$ecomponents/Dialog/confirm";
import {SWRConfig} from "$swr";

Object.map(Utils,(v,i)=>{
  if(typeof v =='function' && typeof window !='undefined' && window && !window[i]){
     window[i] = v;
  }
});

/*****
    les utilitaires disponibles à passer au provider : 
    FontsIconsFilter : (font{object},fontName{string},fontNameLower{string})=><boolean> //porte le nom de la props de appConfig dans lequel définir les filtres à utiliser pour charger l'iconSet désirée pour l'appication
    ///fonction de rappel appelée avant d'exit l'application, doit retourner une promesse que lorsque résolue, exit l'application
    beforeExit : ()=><Promise>     
    getTableData : ()=>{object|array}
    getStructData : ()=>{object|array}
    tablesData : {object:{
      table1:{
        drawerSortOrder:{number,l'ordre d'apparition dans le drawer},showInDrawer:{boolean|{funct<{boolean}>,
        showInFab{boolean},
        showInDrawer{boolean},
        fabProps {object|function({tableName})}, retourne les props à appliquer au composant fab lié à la tabl,
          si elle définit une propriété nomée actions de types tableau, alors, ces actions seront utilisées commes actions personnalisées du fab
      },si l'on affichera la table de données dans le drawers}},
      table2:{},
      table3:{},...[tableN]:{}}
    }, la liste des tables de données
    structsData : {object}, la liste des données de structures
    handleHelpScreen : {boolean}, //si l'écran d'aide sera pris en compte, l'écran d'aide ainsi que les écrans des termes d'utilisations et autres
    convertFiltersToSQL : {boolean}, si les filtres de datagrid ou filtres seront convertis au format SQL
    components : {
        MainProvider : {ReactComponent}, //le composant qui permet de wrapper le contenu de l'application expo. Nb, ce composant ne peut utiliser ni les routes, nis les DialogProvider,
        logo : ReactNode | ReactComponent | object {
           image{ReactComponent} :,
           text {ReactComponent}
        },
        datagrid : {
          ///les props par défaut à passer au composant Datagrid
        },
        customFormFields{Object}, //les composant personalisés des forms fields
        tableLinkPropsMutator : ({object})=><{object}>, la fonction permettant de muter les props du composant TableLink,
        fabPropsMutator : ({object})=><{object}>, la fonction permettant de muter les props du composant Fab, affiché dans les écrans par défaut,
        TableDataScreen | TableDataScreenItem : {ReactComponent}, le composant TableDataScreenItem, à utiliser pour le rendu des écrans
        TableDataScreenList | TableDataListScreen {ReactComponent}, le composant TableDataList à utiliser pour le rendu des écrans listants les éléments du table data
    },
    
    navigation : {
      screens : {Array}, les écrans de navigation,
      screenOptions : {object}, les options du composant Stack.Navigator, voir https://reactnavigation.org/docs/native-stack-navigator/
      drawerItems : {object|array|function}, la fonction permettant d'obtenir les items du drawer principal de l'application, Chaque item du drawer doit avoir la chaine drawerSection, chaine de caractère determinant le code de la section dans lequel l'afficher
      drawerSections : {object : {
          [key{string}]:{string}} |
          [key{string}] : {object { code:{string},label:{Node},order:{number, l'ordre de trie de la section}}}
      } //les différentes sections à utiliser pour le rendu du drawer, deux sections par défaut existent : 
      les sectionis help et dashboard; help pour le rendu des items de la section Aide et Dashboard pour le rendu des items de la section Dashboard/Home
      drawerItemsMutator  : {function}, la fonction permettant de muter les drawerItems à chaque fois qu'on appelle la fonction de récupératioin des drawerItems
      containerProps : {object}, les props à passer au composant NavigationContainer de react-navigation
    },
    auth : {
      profilePropsMutator : {({object})=><{object}> | {object})}, la fonction permettant de muter les champs  à passer à l'écran de mise à jour du profil utilisateur
      loginPropsMutator : ({object})=><{object}>, la fonction permettant de muter les props du composant Login,
    }
    swrConfig : {object},//les paramètres de configuration de l'objet swr utilisée dans le composant SWRDatagrid
    realm : {}, //les options de configurations de la base de données realmdb
*/
const Provider = ({children,getTableData,handleHelpScreen,navigation,swrConfig,auth:cAuth,components:cComponents,convertFiltersToSQL,getStructData,tablesData,structsData,...props})=>{
    require('$session');///initializing session
    const {extendAppTheme} = appConfig;
    const { theme : pTheme } = useMaterial3Theme();
    navigation = defaultObj(navigation);
    const {customFormFields,...components} = defaultObj(cComponents);
    const auth = {
      ...Object.assign({},cAuth),
      loginPropsMutator : (props)=>{
        return extendProps(cAuth.loginPropsMutator,props);
      },
    }
    extendObj(signInRef.current,auth);
    extendFormFields(customFormFields);
    structsData = isObj(structsData)? structsData : null;
    appConfig.tablesData = tablesData;
    handleHelpScreen = handleHelpScreen === false ? false : true;
    appConfig.structsData = appConfig.structsData = isObj(structsData)? structsData : null;
    getTableData = appConfig.getTable = appConfig.getTableData = getTableOrStructDataCall(tablesData,getTableData);
    getStructData = appConfig.getStructData = getTableOrStructDataCall(structsData,getStructData);
    
    ///swr config settings
    ///garde pour chaque écran sa date de dernière activité
    const screensRef = React.useRef({});//la liste des écrans actifs
    const isScreenFocusedRef = React.useRef(true);
    const activeScreenRef = React.useRef('');
    const prevActiveScreenRef = React.useRef('');
    const appStateRef = React.useRef({});
    const swrRefreshTimeout = defaultNumber(swrConfig?.refreshTimeout,SWR_REFRESH_TIMEOUT)
    swrConfig = extendObj({
      provider: () => new Map(),
      isOnline() {
        /* Customize the network state detector */
        if(canFetchOffline) return true;
        return APP.isOnline();
      },
      isVisible() {
        const screen = activeScreenRef.current;
        if(!screen) return false;
        if(!screensRef.current[screen]){
           screensRef.current[screen] = new Date();
           return false;
        }
        const date = screensRef.current[screen];
        const diff = new Date().getTime() - date.getTime();
        screensRef.current[screen] = new Date();
        return diff >= swrRefreshTimeout ? true : false;
      },
      initFocus(callback) {
        let appState = AppState.currentState
        const onAppStateChange = (nextAppState) => {
          /* If it's resuming from background or inactive mode to active one */
          const active = appState.match(/inactive|background/) && nextAppState === 'active';
          if (active) {
            callback()
          }
          appState = nextAppState;
          appStateRef.current = !!active;
        }
        // Subscribe to the app state change events
        const subscription = AppState.addEventListener('change', onAppStateChange);
        return () => {
          subscription?.remove()
        }
      },
      initReconnect(cb) {
        const callback = ()=>{
          cb();
        }
        /* Register the listener with your state provider */
        APP.on(APP.EVENTS.GO_ONLINE,callback);
        return ()=>{
          APP.off(APP.EVENTS.GO_ONLINE,callback);
        }
      }
    },swrConfig);
    if(convertFiltersToSQL !== undefined){
      appConfig.set("convertFiltersToSQL",convertFiltersToSQL);
    }
    const colorScheme = useColorScheme();
    const isColorShemeDark = colorScheme ==="dark";
    if(auth.enabled === false){
      disableAuth();
    } else enableAuth();
    appConfig.extendAppTheme = (theme,Theme,...rest)=>{
        if(!isObj(theme)) return;
        const isDark = theme.dark || theme.isDark || isDynamicThemeSupported && isColorShemeDark ;
        const elevation = defaultObj(theme.elevation,isDark ? pTheme.dark?.elevation : pTheme.light?.elevation)
        const newTheme = isDark ? { ...MD3DarkTheme, colors: pTheme.dark } : { ...MD3LightTheme, colors: pTheme.light };
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
        const r = typeof extendAppTheme == 'function'? extendAppTheme(theme,Theme,...rest)  : theme;
        const _theme = (isObj(r) ? r : theme);
        const customCSS = _theme.customCSS;
        extendObj(Theme,{
          elevations : elevation,
          elevation,
          colorScheme,
          isDynamicThemeSupported,
        })
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
    /**** setDeviceRef */
    setDeviceIdRef.current = ()=>{
      return new Promise((resolve,reject)=>{
        showPrompt({
          title : 'ID unique pour l\'appareil',
          maxLength :  30,
          defaultValue : appConfig.getDeviceId(),
          yes : 'Définir',
          placeholder : isMobileNative()? "":'Entrer une valeur unique sans espace SVP',
          no : 'Annuler',
          onSuccess : ({value})=>{
            let message = null;
            if(!value || value.contains(" ")){
              message = "Merci d'entrer une valeur non nulle ne contenant pas d'espace";
            }
            if(value.length > 30){
              message = "la valeur entrée doit avoir au plus 30 caractères";
            }
            if(message){
              notify.error(message);
              return reject({message})
            }
            resolve(value);
            notify.success("la valeur ["+value+"] a été définie comme identifiant unique pour l'application instalée sur cet appareil");
          }
        })
      })
    }
    
    
    const {screens} = navigation;
    navigation.screens = React.useMemo(()=>{
       const r = prepareScreens({
        tables:tablesData,
        screens,
        TableDataScreen:components.TableDataScreen || components.TableDataScreenItem,
        TableDataScreenList:components.TableDataScreenList||components.TableDataListScreen,
      });
      return [...r,...getMainScreens(handleHelpScreen)];
    },[]);
    navigation.containerProps = defaultObj(navigation.containerProps);
    const {linking} = navigation;
    React.useEffect(()=>{
      const onScreenFocus = ({sanitizedName})=>{
          prevActiveScreenRef.current = activeScreenRef.current;
          if(activeScreenRef.current){
             screensRef.current[activeScreenRef.current] = null;
          }
          screensRef.current[sanitizedName] = new Date();
          activeScreenRef.current = sanitizedName;
          isScreenFocusedRef.current = true;
      }, onScreenBlur = ()=>{
        isScreenFocusedRef.current = false;
      }
      APP.on(APP.EVENTS.SCREEN_FOCUS,onScreenFocus);
      APP.on(APP.EVENTS.SCREEN_BLUR,onScreenBlur);
      return ()=>{
        APP.off(APP.EVENTS.SCREEN_FOCUS,onScreenFocus);
        APP.off(APP.EVENTS.SCREEN_BLUR,onScreenBlur);
      }
    },[]);
    return <ExpoUIContext.Provider 
      value={{
        ...props,
        handleHelpScreen,
        navigation,
        convertFiltersToSQL,
        auth,
        components : {
            ...components,
            tableLinkPropsMutator : (props)=>{
                return extendProps(components.tableLinkPropsMutator,props);
            },
            datagrid : Object.assign({},components.datagrid),
        },
        getTableData,
        getTable : getTableData,
        getStructData,
        tablesData,
        structsData,
        swrConfig,
      }} 
      children={<SWRConfig value={swrConfig}>
        <AuthProvider {...auth} LoginComponent={Login}>{children}</AuthProvider>
      </SWRConfig>}
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