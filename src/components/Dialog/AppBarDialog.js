import AppBar from "$ecomponents/AppBar";
import React from "$react";
import { renderActions } from "./utils";
import {isIos,isAndroid,isWeb} from "$cplatform";
import {useWindowDimensions} from "$cdimensions/utils";

const AppBarDialogComponent = React.forwardRef((props,ref)=>{
    const {actions,responsive,isFullScreen,fullScreen,actionsProps,...rest} = props;
    useWindowDimensions();
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