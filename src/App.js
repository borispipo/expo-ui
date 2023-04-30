import '$session';
import React from 'react';
import {SWRConfig} from "$swr";
import {defaultObj} from "$cutils";
import  {updateTheme,defaultTheme} from "$theme";
import {Provider as PaperProvider } from 'react-native-paper';
import Index from './index';
import notify  from "$notify";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesContext } from './Preferences';
import {AuthProvider} from '$cauth';
import ErrorBoundary from "$ecomponents/ErrorBoundary";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import StatusBar from "$ecomponents/StatusBar";
import APP from "$app";
import FontIcon from "$ecomponents/Icon/Font"
import {isMobileNative} from "$cplatform";
import {setDeviceIdRef} from "$capp";
import appConfig from "$capp/config";
import {showPrompt} from "$components/Dialog/confirm";
import { AppState } from 'react-native'
import {canFetchOffline} from "$capi/utils";
import {defaultNumber} from "$cutils";
import { timeout as SWR_REFRESH_TIMEOUT} from '$ecomponents/Datagrid/SWRDatagrid';
import { Dimensions,Keyboard } from 'react-native';
import {isTouchDevice} from "$platform";
import * as Utils from "$cutils";
Object.map(Utils,(v,i)=>{
  if(typeof v =='function' && typeof window !='undefined' && window && !window[i]){
     window[i] = v;
  }
});
export default function getIndex({onMount,onUnmount,swrConfig,render,onRender,preferences:appPreferences,...rest}){
  const isScreenFocusedRef = React.useRef(true);
    ///garde pour chaque écran sa date de dernière activité
    const screensRef = React.useRef({});//la liste des écrans actifs
    const activeScreenRef = React.useRef('');
    const prevActiveScreenRef = React.useRef('');
    const appStateRef = React.useRef({});
    const isKeyboardOpenRef = React.useRef(false);
    React.useOnRender(onRender);
    swrConfig = defaultObj(swrConfig);
    React.useEffect(()=>{
        ///la fonction de rappel lorsque le composant est monté
        let cb = typeof onMount =='function'? onMount() : null;
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
        const triggerKeyboardToggle = (status)=>{
          APP.trigger(APP.EVENTS.KEYBOARD_DID_TOGGLE,{shown:status,status,visible:status,hide : !status});
        }
        const keyBoardDidShow = ()=>{
          APP.trigger(APP.EVENTS.KEYBOARD_DID_SHOW);
          triggerKeyboardToggle(true);
        },keyBoardDidHide = ()=>{
          APP.trigger(APP.EVENTS.KEYBOARD_DID_HIDE);
          triggerKeyboardToggle(false);
        }
        const keyBoardDidShowListener = Keyboard.addListener("keyboardDidShow",keyBoardDidShow);
        const keyBoardDidHideListener = Keyboard.addListener("keyboardDidHide",keyBoardDidHide);
        const listener = isTouchDevice() && typeof window !=='undefined' && window && window.visualViewport && typeof window.visualViewport.addEventListener =='function'? 
          () => {
            const minKeyboardHeight = 300;
            const screen = Dimensions.get("screen");
            const newState = screen.height - minKeyboardHeight > window.visualViewport.height
            if (isKeyboardOpenRef.current != newState) {
                isKeyboardOpenRef.current = newState;
                newState ? keyBoardDidShow() : keyBoardDidHide();
            }
        } : undefined;
        if(listener){
            window.visualViewport.addEventListener('resize', listener);
        }
        return ()=>{
          APP.off(APP.EVENTS.SCREEN_FOCUS,onScreenFocus);
          APP.off(APP.EVENTS.SCREEN_BLUR,onScreenBlur);
          keyBoardDidShowListener && keyBoardDidShowListener.remove && keyBoardDidShowListener.remove();
          keyBoardDidHideListener && keyBoardDidHideListener.remove && keyBoardDidHideListener.remove();
          if(listener){
            window.visualViewport.removeEventListener('resize', listener);
          }
          if(typeof onUnmount =='function'){
             onUnmount();
          }
          if(typeof cb =='function'){
             cb();
          }
        }
    },[])
    const [theme,setTheme] = React.useState(updateTheme(defaultTheme));
    const updatePreferenceTheme = (customTheme,persist)=>{
      setTheme(updateTheme(customTheme));
    };
    const forceRender = React.useForceRender();
    const pref = typeof appPreferences =='function'? appPreferences({setTheme,forceRender,updateTheme:updatePreferenceTheme}) : appPreferences;
    const preferences = React.useMemo(()=>({
        updateTheme:updatePreferenceTheme,
        theme,
        ...defaultObj(pref),
    }),[theme,pref]);
    const child = <Index {...rest} theme={theme}/>;
    const content = typeof render == 'function'? render({children:child,appConfig,config:appConfig}) : child;  
    return (
      <SWRConfig 
        value={{
          ...swrConfig,
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
            const timeout = defaultNumber(appConfig.get("swrRefreshTimeout"),SWR_REFRESH_TIMEOUT)
            screensRef.current[screen] = new Date();
            return diff >= timeout ? true : false;
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
          initReconnect(callback) {
            /* Register the listener with your state provider */
            APP.on(APP.EVENTS.GO_ONLINE,callback);
            return ()=>{
              APP.off(APP.EVENTS.GO_ONLINE,callback);
            }
          }
        }}
      >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <PaperProvider 
                theme={theme}
                settings={{
                  icon: (props) => {
                    return <FontIcon {...props}/>
                  },
                }}
            >
              <SafeAreaProvider>
                <AuthProvider>
                    <ErrorBoundary>
                      <StatusBar/>
                      <PreferencesContext.Provider value={preferences}>
                        {React.isValidElement(content) && content || child}
                      </PreferencesContext.Provider>  
                    </ErrorBoundary>
                  </AuthProvider>
              </SafeAreaProvider>
            </PaperProvider>
        </GestureHandlerRootView>
      </SWRConfig>
    );
};

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