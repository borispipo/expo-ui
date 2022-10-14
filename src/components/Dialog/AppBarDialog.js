import AppBar from "$ecomponents/AppBar";
import React from "$react";
import APP from "$app/instance";
import { renderActions } from "./utils";
import {isIos,isAndroid,isWeb} from "$platform";

const AppBarDialogComponent = React.forwardRef((props,ref)=>{
    const {actions,responsive,isFullScreen,fullScreen,actionsProps,...rest} = props;
    const forceRender = React.useForceRender();
    React.useEffect(()=>{
        const onResize = ()=>{
            forceRender();
         }
        if(responsive){
            APP.on(APP.EVENTS.RESIZE_PAGE,onResize);
        }
        return ()=>{
            APP.off(APP.EVENTS.RESIZE_PAGE,onResize);
        }
    },[]);
    
    if(responsive && !isFullScreen() || (typeof fullScreen =='boolean' && !fullScreen)){
        return null;
    }
    return <AppBar
        statusBarHeight = {isIos()?undefined:0}  
        testID = "RN_DialogComponent_AppBar"
        {...rest}
        bindResizeEvent = {!responsive}
        style = {[
            //isAndroid()?{marginTop:10}:null,
            rest.style,
        ]}
        ref = {ref}
        actions = {renderActions({...rest,...defaultObj(actionsProps),actions,isAppBarAction:true,isFullScreen,fullScreen:true})}
    />
});

export default AppBarDialogComponent;

AppBarDialogComponent.displayName = "AppBarDialogComponent"