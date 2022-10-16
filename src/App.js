import '$session';
import React from 'react';
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

export default function getIndex(options){
  const {App} = defaultObj(options);
  const child = <Index theme={theme}/>;
  const children = typeof App =='function'? App({children:child}) : child;
  return function MainIndexComponent() {
    React.useEffect(()=>{
        return ()=>{}
    },[])
    const [theme,setTheme] = React.useState(updateTheme(defaultTheme));
    const preferences = React.useMemo(()=>({
        updateTheme : (customTheme,persist)=>{
          setTheme(updateTheme(customTheme));
        },
        theme,
    }),[theme]);
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