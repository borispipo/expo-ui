import initScreens from "$escreens";
import {handleContent,sanitizeName} from '$escreens';
import {setInitialRouteName } from "$cnavigation";
import React from "$react";
import DrawerNavigator from "./Drawer";
import useContext from "$econtext/hooks";
import { MainNavigationProvider } from "./hooks";
import {isWeb,isAndroid} from "$cplatform";
import Stack from "./Stack";
import theme from "$theme";
import {defaultObj} from "$cutils";

export * from "./hooks";

export * from "./utils";

/**** la fonction onGetStart doit normalement être appélée lorsque l'application 
 *  lorsque hasGetStarted est à false, celle-ci rend l'écran Start permettant de rendre le contenu GetStarted
*/
export default function NavigationComponent (props){
    let {state,hasGetStarted,isLoading,onGetStart,initialRouteName,...rest} = props;
    if(isLoading) return null;
    const {navigation:{screens,screenOptions}} = useContext();
    const allScreens = initScreens({Factory:Stack,screens,ModalFactory:Stack,filter:({name})=>{
        return true;
    }});
    initialRouteName = sanitizeName(initialRouteName);
    const drawerScreens = handleContent({screens:allScreens,onGetStart,hasGetStarted,initialRouteName,state,Factory:Stack});
    const stackScreens = handleContent({screens:allScreens.modals,onGetStart,hasGetStarted,initialRouteName,state,Factory:Stack});
    if(!drawerScreens.length && !stackScreens.length){
       console.error("apps will stuck on splash screen because any valid screen has been found on screens ",allScreens);
    }
    setInitialRouteName(initialRouteName);
    const opts = {
        headerShown : false,
        header : ()=> null,
        headerStyle: { backgroundColor: theme.colors.primary},
        presentation : isAndroid() || isWeb()? "modal":"default",
        animationEnabled : !isWeb(),
        ...Object.assign({},screenOptions)
    }
    const cardStyle = { backgroundColor: 'transparent' };
    if(isWeb()){
        cardStyle.flex = 1;
    }
    return <MainNavigationProvider {...rest} onGetStart={onGetStart} state={state} initialRouteName={initialRouteName}>
        <DrawerNavigator {...props}>
            {<Stack.Navigator 
                initialRouteName={initialRouteName} 
                screenOptions={opts}
            >
                    {<Stack.Group screenOptions={{...opts}}>
                        {drawerScreens}
                    </Stack.Group>}
                    <Stack.Group
                        key = {"MODAL-DRAWERS-SCREENS"}
                        screenOptions={{
                            ...opts,
                            presentation :"transparentModal",
                            cardStyle,
                            animationEnabled : true,
                        }}
                    >
                        {stackScreens}
                    </Stack.Group>
                </Stack.Navigator> }
        </DrawerNavigator>
    </MainNavigationProvider>
}

export * from "$cnavigation";