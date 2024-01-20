import initScreens from "$escreens";
import {handleContent,sanitizeName} from '$escreens';
import {setInitialRouteName } from "$cnavigation";
import React from "$react";
import DrawerNavigator from "./Drawer";
import useContext from "$econtext/hooks";
import { MainNavigationProvider } from "./hooks";
import {isWeb,isAndroid} from "$cplatform";
import Stack  from "./Stack";
import { getAnimation } from "./animationTypes";
import {extendObj,defaultObj} from "$cutils";
import theme from "$theme";;

export * from "./hooks";

export * from "./utils";

/**** la fonction onGetStart doit normalement être appélée lorsque l'application 
 *  lorsque hasGetStarted est à false, celle-ci rend l'écran Start permettant de rendre le contenu GetStarted
*/
export default function NavigationComponent (props){
    let {state,hasGetStarted,isLoading,onGetStart,initialRouteName,...rest} = props;
    const cardStyleInterpolator = null;//getAnimation();
    const {navigation:{screens,screenOptions}} = useContext();
    const allScreens = initScreens({Factory:Stack,screens,ModalFactory:Stack});
    initialRouteName = sanitizeName(initialRouteName);
    const drawerScreens = handleContent({screens:allScreens,onGetStart,hasGetStarted,initialRouteName,state,Factory:Stack});
    const stackScreens = handleContent({screens:allScreens.modals,onGetStart,hasGetStarted,initialRouteName,state,Factory:Stack});
    if(!drawerScreens.length && !stackScreens.length){
       console.error("apps will stuck on splash screen because any valid screen has been found on screens ",allScreens);
    }
    setInitialRouteName(initialRouteName);
    const getScreenOptions = (options,opt2)=>{
        const sOptions = defaultObj(typeof screenOptions =='function'? screenOptions(options) : screenOptions);
        const {navigation} = options;
        return extendObj(true,{},{
            headerShown : false,
            header : ()=> null,
            headerStyle: { backgroundColor: theme.colors.primary},
            presentation : isAndroid() || isWeb()? "modal":"default",
            animationEnabled : !isWeb(),
            detachPreviousScreen: !navigation.isFocused(),
            cardStyleInterpolator,
            ...Object.assign({},getAnimation()),
            ...defaultObj(opt2),
        },sOptions);
    }
    const cardStyle = { backgroundColor: 'transparent' };
    if(isWeb()){
        cardStyle.flex = 1;
    }
    return <MainNavigationProvider {...rest} onGetStart={onGetStart} state={state} initialRouteName={initialRouteName}>
        <DrawerNavigator {...props}>
            {<Stack.Navigator 
                initialRouteName={initialRouteName} 
                screenOptions={getScreenOptions}
            >
                    {<Stack.Group>
                        {drawerScreens}
                    </Stack.Group>}
                    <Stack.Group
                        key = {"MODAL-DRAWERS-SCREENS"}
                        screenOptions={function(options){
                            return getScreenOptions(options,{
                                presentation :"transparentModal",
                                cardStyle,
                                animationEnabled : false,
                            })
                        }}
                    >
                        {stackScreens}
                    </Stack.Group>
                </Stack.Navigator> }
        </DrawerNavigator>
    </MainNavigationProvider>
}

export * from "$cnavigation";

export * from "./animationTypes";