import initScreens from "$escreens";
import {handleContent,sanitizeName} from '$escreens';
import {Stack,setInitialRouteName } from "$cnavigation";
import React from "$react";
import DrawerNavigator from "./Drawer";

export default function NavigationComponent (props){
    let {state,hasGetStarted,initialRouteName,extra} = props;
    const allScreens = initScreens({Factory:Stack,ModalFactory:Stack,filter:({name,Screen})=>{
        return (name === initialRouteName? defaultObj(extra) : true);
    }});
    
    initialRouteName = sanitizeName(initialRouteName);
    const drawerScreens = handleContent({screens:allScreens,hasGetStarted,initialRouteName,state,Factory:Stack});
    const stackScreens = handleContent({screens:allScreens.modals,hasGetStarted,initialRouteName,state,Factory:Stack});
    if(!drawerScreens.length && !stackScreens.length){
       willRenderNavigation = false;
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