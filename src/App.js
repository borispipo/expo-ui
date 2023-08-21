import '$session';
import React from 'react';
import {SWRConfig} from "$swr";
import Index from './index';
import notify  from "$notify";
import APP from "$app";
import {isMobileNative} from "$cplatform";
import {setDeviceIdRef} from "$capp";
import {showPrompt} from "$ecomponents/Dialog/confirm";
import { AppState } from 'react-native'
import {canFetchOffline} from "$capi/utils";
import {defaultNumber} from "$cutils";
import { timeout as SWR_REFRESH_TIMEOUT} from '$ecomponents/Datagrid/SWRDatagrid';
import { Dimensions,Keyboard } from 'react-native';
import {isTouchDevice} from "$platform";
import * as Utils from "$cutils";
import {useContext} from "$econtext/hooks";
import appConfig from "$capp/config";
import { useKeepAwake } from 'expo-keep-awake';

Object.map(Utils,(v,i)=>{
  if(typeof v =='function' && typeof window !='undefined' && window && !window[i]){
     window[i] = v;
  }
});

export default function getIndex({onMount,onUnmount,render,onRender,init}){
    const {swrConfig} = useContext();
    const isScreenFocusedRef = React.useRef(true);
    isMobileNative() && useKeepAwake();
    ///garde pour chaque écran sa date de dernière activité
    const screensRef = React.useRef({});//la liste des écrans actifs
    const activeScreenRef = React.useRef('');
    const prevActiveScreenRef = React.useRef('');
    const appStateRef = React.useRef({});
    const isKeyboardOpenRef = React.useRef(false);
    React.useOnRender(onRender);
    React.useEffect(()=>{
        ///la fonction de rappel lorsque le composant est monté
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
        }
    },[])
      
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
            const timeout = defaultNumber(swrConfig.refreshTimeout,SWR_REFRESH_TIMEOUT)
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
        }}
      >
       <Index onMount={onMount} render={render} onUnmount={onUnmount} onRender={onRender} init={init}/>
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