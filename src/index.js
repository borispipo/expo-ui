import React from "$react"
import { AppState} from "react-native";
import BackHandler from "$ecomponents/BackHandler";
import * as Linking from 'expo-linking';
import APP from "$capp";
import {AppStateService,trackIDLE,stop as stopIDLE} from "$capp/idle";
import { NavigationContainer} from '@react-navigation/native';
import {navigationRef} from "$cnavigation"
import NetInfo from '$cutils/NetInfo';
import Auth from "$cauth";
import {isNativeMobile,isElectron} from "$cplatform";
import Navigation from "./navigation";
import {set as setSession,get as getSession} from "$session";
import { showConfirm } from "$ecomponents/Dialog";
import {close as closePreloader, isVisible as isPreloaderVisible} from "$epreloader";
import SplashScreen from "$ecomponents/SplashScreen";
import {decycle} from "$cutils/json";
import init from "$capp/init";
import { setIsInitialized} from "$capp/utils";
import {isObj,isNonNullString,isPromise,defaultObj,defaultStr} from "$cutils";
import {loadFonts} from "$ecomponents/Icon/Font";
import appConfig from "$capp/config";
import Preloader from "$preloader";
import {PreloaderProvider} from "$epreloader";
import BottomSheetProvider from "$ecomponents/BottomSheet/Provider";
import DialogProvider from "$ecomponents/Dialog/Provider";
import SimpleSelect from '$ecomponents/SimpleSelect';
import {Provider as AlertProvider} from '$ecomponents/Dialog/confirm/Alert';
import { DialogProvider as FormDataDialogProvider } from '$eform/FormData';
import {Portal } from 'react-native-paper';
import {PortalProvider} from '$ecomponents/Portal';
import ErrorBoundaryProvider from "$ecomponents/ErrorBoundary/Provider";
import notify, {notificationRef} from "$notify";
import DropdownAlert from '$ecomponents/Dialog/DropdownAlert';
import {AuthProvider} from '$cauth';
import { PreferencesContext } from './Preferences';
import ErrorBoundary from "$ecomponents/ErrorBoundary";
import  {updateTheme,defaultTheme} from "$theme";
import StatusBar from "$ecomponents/StatusBar";
import {Provider as PaperProvider } from 'react-native-paper';
import FontIcon from "$ecomponents/Icon/Font";
import useContext from "$econtext";

let MAX_BACK_COUNT = 1;
let countBack = 0;
let isBackConfirmShowing = false;  

const resetExitCounter = ()=>{
  countBack = 0
  isBackConfirmShowing = false;
};

const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

/****
 *  init {function}: ()=>Promise<{}> est la fonction d'initialisation de l'application
 *  initialRouteName : la route initiale par défaut
 *  getStartedRouteName : la route par défaut de getStarted lorsque l'application est en mode getStarted, c'est à dire lorsque la fonction init renvoie une erreur (reject)
 */
function App({init:initApp,initialRouteName:appInitialRouteName,render,onMount,preferences:appPreferences,getStartedRouteName}) {
  AppStateService.init();
  const {FontsIconsFilter,beforeExit} = useContext();
  const [initialState, setInitialState] = React.useState(undefined);
  const appReadyRef = React.useRef(true);
  const [state,setState] = React.useState({
     isLoading : true,
     isInitialized:false,
  });
   React.useEffect(() => {
    const loadResources = ()=>{
       return new Promise((resolve)=>{
          loadFonts(FontsIconsFilter).catch((e)=>{
            console.warn(e," ierror loading app resources fonts");
          }).finally(()=>{
            resolve(true);
          });
       })
    }
    const restoreState = () => {
       return new Promise((resolve,reject)=>{
          (async ()=>{
            try {
              const initialUrl = await Linking.getInitialURL();
              if (isNativeMobile() || initialUrl === null) {
                const savedState = getSession(NAVIGATION_PERSISTENCE_KEY);
                if (isObj(savedState)) {
                  setInitialState(savedState);
                }
              }
            } catch(e){ console.log(e," is state error")}
            finally { 
                appReadyRef.current = true;
                resolve({});
            }
          })();
       });
    };
    const subscription = AppState.addEventListener('change', AppStateService.getInstance().handleAppStateChange);
    const beforeExitApp = (cb)=>{
       return new Promise((resolve,reject)=>{
          Preloader.closeAll();
          showConfirm({
              title : "Quitter l'application",
              message : 'Voulez vous vraiment quitter l\'application?',
              yes : 'Oui',
              no : 'Non',
              onSuccess : ()=>{
                const foreceExit = ()=>{
                  BackHandler.exitApp();
                    if(isElectron() && window.ELECTRON && typeof ELECTRON.exitApp =='function'){
                        ELECTRON.exitApp({APP});
                    }
                }
                const exit = ()=>{
                  if(typeof beforeExit =='function'){
                     const r2 = beforeExit()
                     if(!isPromise(r2)){
                        throw {message:'La fonction before exit du contexte doit retourner une promesse',returnedResult:r2}
                     }
                     return r2.then(foreceExit).catch(reject);
                  }
                  foreceExit();
                }
                const r = {APP,exit};
                APP.trigger(APP.EVENTS.BEFORE_EXIT,exit,(result)=>{
                  if(isObj(result) || Array.isArray(result)){
                    for(let ik in result){
                       if(result[ik] === false) return reject({message:'EXIT APP DENIED BY BEFORE EXIT EVENT HANDLER AT POSITON {0}'.sprintf(ik)});
                    }
                  }
                  resolve(r);
                  if(typeof cb =='function'){
                     cb(r);
                  }
                });
              },
              onCancel : reject
          })
       })
    }
    /**** onBeforeExit prend en paramètre la fonction de rappel CB, qui lorsque la demande de sortie d'application est acceptée, alors elle est exécutée */
    if(typeof APP.beforeExit !=='function'){
      Object.defineProperties(APP,{
         beforeExit : {
            value : beforeExitApp,
         }
      })
    }
    const backAction = (args) => {
      if(navigationRef && navigationRef.canGoBack()? true : false){
          resetExitCounter();
          navigationRef.goBack(null);
          return false;
      }
      if(isBackConfirmShowing) {
        return;
      }
      if(countBack < MAX_BACK_COUNT){
          countBack++;
          isBackConfirmShowing = false;
          if(countBack === MAX_BACK_COUNT){
              notify.toast({text:'Cliquez à nouveau pour quiiter l\'application'});
          }
          if(countBack === 2 && isPreloaderVisible()) {
              closePreloader();
          }
          return false;
      }
      isBackConfirmShowing = true;
      return beforeExitApp().finally(x=>{
        isBackConfirmShowing = false;
      }).then(({exit})=>{
          exit();
      })
    };
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
       APP.setOnlineState(state);
    });
    NetInfo.fetch().catch((e)=>{
      console.log(e," is net info heinn")
    });
    loadResources().finally(()=>{
      (typeof initApp =='function'?initApp : init)().then((args)=>{
        if(Auth.isLoggedIn()){
           Auth.loginUser(false);
        }
        setState({
          ...state,hasGetStarted:true,...defaultObj(args && args?.state),isInitialized:true,isLoading : false,
        });  
      }).catch((e)=>{
          console.error(e," initializing app")
          setState({...state,isInitialized:true,isLoading : false,hasGetStarted:false});
      })
    });

    const Events = {}
    let events = [];
    if(navigationRef && navigationRef.addListener){
        for(let i in Events){
          events.push(navigationRef.addListener(i,Events[i]));
        }
    }
    APP.onElectron("BEFORE_EXIT",()=>{
      return beforeExitApp().then(({exit})=>{
        exit();
      })
    });
    APP.on(APP.EVENTS.BACK_BUTTON,backAction);
    return () => {
        APP.off(APP.EVENTS.BACK_BUTTON,backAction);
        
        if(subscription && subscription.remove){
          subscription.remove();
        }
        events.map((ev)=>{
          if(typeof ev =="function") ev();
        })
        unsubscribeNetInfo();
        stopIDLE(false,true);
        
    }   
  }, []);
  const {isInitialized} = state;
  const isLoading = state.isLoading || !isInitialized || !appReadyRef.current? true : false;
    React.useEffect(()=>{
      if(isInitialized){
          setIsInitialized(true);
          trackIDLE(true);
      }
  },[isInitialized]);
  const hasGetStarted = state.hasGetStarted !== false? true : false;
  const themeRef = React.useRef(null);
  const [theme,setTheme] = React.useState(themeRef.current || updateTheme(defaultTheme));
  themeRef.current = theme;
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
  const isLoaded = !isLoading;
  const prevIsLoaded = React.usePrevious(isLoaded);
  const onMountRef = React.useRef(false);
  React.useEffect(()=>{
    if(prevIsLoaded == isLoaded || !isLoaded || onMountRef.current) return;
    if(typeof onMount ==='function'){
      onMount({appConfig});
      onMountRef.current = true;
    }
  },[isLoaded])
  const child = isLoaded ? <NavigationContainer 
    ref={navigationRef}
    initialState={initialState}
    onStateChange={(state) =>{
        setSession(NAVIGATION_PERSISTENCE_KEY,decycle(state),false);
    }
  }
  >
    <PortalProvider>
      <Portal.Host>
        <PreloaderProvider/>   
        <DialogProvider responsive/>
        <AlertProvider SimpleSelect={SimpleSelect}/>
        <FormDataDialogProvider/>  
        <BottomSheetProvider/>
        <DropdownAlert ref={notificationRef}/>
        <ErrorBoundaryProvider/>  
        <Navigation
          initialRouteName = {defaultStr(hasGetStarted ? appInitialRouteName : getStartedRouteName,"Home")}
          state = {state}
          hasGetStarted = {hasGetStarted}
          isInitialized = {!isLoading}
          onGetStart = {(e)=>{
            setState({...state,hasGetStarted:true})
          }}
        />
      </Portal.Host>
    </PortalProvider>
  </NavigationContainer>  : null;
  const content = isLoaded ? typeof render == 'function'? render({children:child,appConfig,config:appConfig}) : child : null;
  return (<SplashScreen isLoaded={!isLoading}>
      <AuthProvider>
        <PaperProvider 
          theme={theme}
          settings={{
            icon: (props) => {
              return <FontIcon {...props}/>
            },
          }}
        >
          <ErrorBoundary>
          <StatusBar/>
          <PreferencesContext.Provider value={preferences}>
            {React.isValidElement(content) && content || child}
          </PreferencesContext.Provider>  
        </ErrorBoundary>
      </PaperProvider>
      </AuthProvider>
  </SplashScreen>);
}

export default App;