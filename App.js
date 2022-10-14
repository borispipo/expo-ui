import '$session';
import appConfig  from '$app/config';;
import React from 'react';
import  {updateTheme,defaultTheme} from "$theme";
import { AppRegistry} from 'react-native';
import {Provider as PaperProvider } from 'react-native-paper';
import App from '$src';
import {Portal } from 'react-native-paper';
import {PreloaderProvider} from "$preloader";
import DropdownAlert from '$components/Dialog/DropdownAlert';
import {notificationRef} from "$notify";
import BottomSheetProvider from "$components/BottomSheet/Provider";
import DialogProvider from "$components/Dialog/Provider";
import { DialogProvider as FormDataDialogProvider } from './src/components/Form/FormData';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesContext } from './src/Preferences';
import {AuthProvider} from '$cauth';
import {PortalProvider } from '$components/Portal';
import ErrorBoundary from "$components/ErrorBoundary";
import ErrorBoundaryProvider from "$components/ErrorBoundary/Provider";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import StatusBar from "$components/StatusBar";
import SimpleSelect from '$components/SimpleSelect';
import {Provider as AlertProvider} from '$components/Dialog/confirm/Alert';

export default function MainAppComponent() {
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
                                      <App theme={theme}/>
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
AppRegistry.registerComponent(appConfig.name || appConfig.id, () => Main);