import React from "$react"
import { AppState,Linking,BackHandler,} from "react-native"
import APP from "$app";
import {HOME as HOME_SCREEN_NAME} from "$screens/Home/routes";
import {AppStateService,trackIDLE,stop as stopIDLE} from "$app/idle";
import { NavigationContainer} from '@react-navigation/native';
import {navigationRef} from "$cnavigation/utils"
import NetInfo from '$utils/NetInfo';
import Auth from "$cauth";
import {isNativeMobile} from "$platform";
import Navigation from "$navigation";
import {set as setSession,get as getSession} from "$session";
import { showConfirm } from "$components/Dialog";
import {close as closePreloader, isVisible as isPreloaderVisible} from "$preloader";
import SplashScreen from "$components/SplashScreen";
import {notify} from "$components/Dialog";
import {decycle} from "$utils/json";
import init from "$app/init";
import { setIsInitialized} from "$app/utils";

let MAX_BACK_COUNT = 1;
let countBack = 0;
let isBackConfirmShowing = false;  

const resetExitCounter = ()=>{
  countBack = 0;
  isBackConfirmShowing = false;
};

const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

function App(props) {
  AppStateService.init();
  const [initialState, setInitialState] = React.useState(undefined);
  const appReadyRef = React.useRef(false);
  const [state,setState] = React.useState({
     isLoading : true,
     isInitialized:false,
  });
  React.useEffect(() => {
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
      showConfirm({
          title : "Quitter l'application",
          message : 'Voulez vous vraiment quitter l\'application?',
          yes : 'Oui',
          no : 'Non',
          onSuccess : ()=>{
              isBackConfirmShowing = false;
              countBack = 0;
              BackHandler.exitApp();
          },
          onCancel : ()=>{
              isBackConfirmShowing = false;
              countBack = 0;
              return;
          }
      })
    };
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
       APP.setOnlineState(state);
    });
    NetInfo.fetch().catch((e)=>{});
    restoreState().then(()=>{
      init().then(()=>{
        if(Auth.isLoggedIn()){
          Auth.loginUser(false);
        }
        setState({
          ...state,isInitialized:true,isLoading : false,
        });  
      }).catch((e)=>{
          setState({...state,isInitialized:true,isLoading : false});
      });
    });

    const Events = {}
    let events = [];
    if(navigationRef && navigationRef.addListener){
        for(let i in Events){
          events.push(navigationRef.addListener(i,Events[i]));
        }
    }

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
  const hasGetStarted = true;
  const isLoading = state.isLoading || !isInitialized || !appReadyRef.current ? true : false;
    React.useEffect(()=>{
      if(isInitialized){
          setIsInitialized(true);
          trackIDLE(true);
      }
  },[isInitialized]);
  const initialRouteName = HOME_SCREEN_NAME;
  return (<SplashScreen isLoaded={!isLoading}>
      <NavigationContainer 
          ref={navigationRef}
          initialState={initialState}
          onStateChange={(state) =>{
              setSession(NAVIGATION_PERSISTENCE_KEY,decycle(state),false);
          }
        }
      >
          <Navigation
            initialRouteName = {initialRouteName}
            state = {state}
            hasGetStarted = {hasGetStarted}
          />
      </NavigationContainer> 
  </SplashScreen>);
}

export default App;