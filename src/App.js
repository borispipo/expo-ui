import '$session';
import React from 'react';
import {defaultObj} from "$utils";
import  {updateTheme,defaultTheme} from "$theme";
import {Provider as PaperProvider } from 'react-native-paper';
import Index from './index';
import {Portal } from 'react-native-paper';
import {PreloaderProvider} from "$epreloader";
import DropdownAlert from '$ecomponents/Dialog/DropdownAlert';
import {notificationRef} from "$notify";
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