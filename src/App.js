import '$session';
import React from 'react';
import {defaultObj} from "$utils";
import  {updateTheme,defaultTheme} from "$theme";
import {Provider as PaperProvider } from 'react-native-paper';
import Index from './index';
import {Portal } from 'react-native-paper';
import {PreloaderProvider} from "$epreloader";
import DropdownAlert from '$ecomponents/Dialog/DropdownAlert';
import notify, {notificationRef} from "$notify";
import BottomSheetProvider from "$ecomponents/BottomSheet/Provider";
import DialogProvider from "$ecomponents/Dialog/Provider";
import { DialogProvider as FormDataDialogProvider } from '$eform/FormData';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesContext } from './Preferences';
import {AuthProvider} from '$cauth';
import {PortalProvider } from '$ecomponents/Portal';
import ErrorBoundary from "$ecomponents/ErrorBoundary";
import ErrorBoundaryProvider from "$ecomponents/ErrorBoundary/Provider";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import StatusBar from "$ecomponents/StatusBar";
import SimpleSelect from '$ecomponents/SimpleSelect';
import {Provider as AlertProvider} from '$ecomponents/Dialog/confirm/Alert';
import APP from "$app";
import {isMobileNative} from "$cplatform";
import {setDeviceNameRef} from "$capp";
import appConfig from "$capp/config";
import {showPrompt} from "$components/Dialog/confirm";

export default function getIndex(options){
  const {App,onMount,onUnmount,preferences:appPreferences} = defaultObj(options);
  return function MainIndexComponent() {
    React.useEffect(()=>{
        ///la fonction de rappel lorsque le composant est monté
        let cb = typeof onMount =='function'? onMount() : null;
        return ()=>{
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
    const child = <Index theme={theme}/>;
    const children = typeof App =='function'? App({children:child,APP}) : child;
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              <AuthProvider>
                  <PortalProvider>
                    <Portal.Host>
                        <ErrorBoundary>
                              <StatusBar/>
                              <PreferencesContext.Provider value={preferences}>
                                <DropdownAlert ref={notificationRef}/> 
                                <PreloaderProvider/>   
                                <DialogProvider responsive/>
                                <AlertProvider SimpleSelect={SimpleSelect}/>
                                <FormDataDialogProvider/>  
                                {children}
                                <ErrorBoundaryProvider/>
                                <BottomSheetProvider/>
                              </PreferencesContext.Provider>  
                        </ErrorBoundary>
                    </Portal.Host>
                  </PortalProvider>
                </AuthProvider>
            </SafeAreaProvider>
          </PaperProvider>
      </GestureHandlerRootView>
    );
  }
};

setDeviceIdRef.current = ()=>{
  return new Promise((resolve,reject)=>{
    showPrompt({
      title : 'ID unique pour l\'appareil',
      maxLength :  30,
      defaultValue : appConfig.getDeviceName(),
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