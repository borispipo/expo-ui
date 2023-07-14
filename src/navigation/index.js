import initScreens from "$escreens";
import {handleContent,sanitizeName} from '$escreens';
import {Stack,setInitialRouteName } from "$cnavigation";
import React from "$react";
import DrawerNavigator from "./Drawer";
import useContext from "$econtext/hooks";

export * from "./utils";

/**** la fonction onGetStart doit normalement être appélée lorsque l'application 
 *  lorsque hasGetStarted est à false, celle-ci rend l'écran Start permettant de rendre le contenu GetStarted
*/
export default function NavigationComponent (props){
    let {state,hasGetStarted,onGetStart,initialRouteName,extra} = props;
    const {navigation:{screens}} = useContext();
    const allScreens = initScreens({Factory:Stack,screens,ModalFactory:Stack,filter:({name})=>{
        if(name === initialRouteName){
            extra = defaultObj(extra);
            extra.onGetStart = onGetStart;
            extra.state = state;
            return extra;
        }
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
    }
    return <DrawerNavigator {...props}>
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
                        presentation: 'transparentModal', 
                    }}
                >
                    {stackScreens}
                </Stack.Group>
            </Stack.Navigator> }
    </DrawerNavigator>
}

export * from "$cnavigation";