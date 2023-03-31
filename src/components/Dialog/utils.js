import {defaultObj} from "$cutils";
import {flattenStyle} from "$theme";
import {Dimensions} from "react-native";
import {splitActions} from "$ecomponents/AppBar/utils";

const MIN_DIALOG_HEIGHT = 250;

export const MAX_WIDTH = 380;

export const MIN_WIDTH = 300;

export const SCREEN_INDENT = 50;

export const MIN_HEIGHT = 250;

export const renderActions = ({actions,actionProps,maxActions,isFullScreen,fullScreen,...rest})=>{
    actionProps = defaultObj(actionProps);
    fullScreen = defaultBool(fullScreen,false);
    maxActions = maxActions !== undefined ? maxActions : fullScreen ? undefined : 2;
    const {width:wWidth} = Dimensions.get("window");
    let windowWidth = undefined;
    if(!fullScreen){
        windowWidth = MAX_WIDTH+100;
        if(windowWidth > wWidth){
            windowWidth = wWidth - 50;
        }
        actionProps.style = {marginLeft:10,...Object.assign({},flattenStyle(actionProps.style))}
    }
    if(typeof actions ==='function'){
        actions = actions({actions,actionProps,maxActions,fullScreen,...defaultObj(rest)})
    }
    return splitActions({...defaultObj(rest),windowWidth,isAppBarAction:fullScreen,actionProps,actions,maxActions,stylingAction:fullScreen,isDialogAction:true,isFullScreenDialog:fullScreen});
}