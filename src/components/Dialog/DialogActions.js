import React from "$react";
import {Dialog} from "react-native-paper";
import Menu from "$ecomponents/Menu";
import theme,{Colors,flattenStyle} from "$theme";
import {MORE_ICON} from "$ecomponents/Icon/utils";
import {renderActions} from "./utils";
import View from "$ecomponents/View";
import { StyleSheet } from "react-native";
import DialogActions from "./RNPDialogActions";

const DialogActionsComponent = React.forwardRef(({actions,isAlert,onAlertRequestClose,testID,containerProps,actionMutator,actionProps,cancelButton,responsive,isFullScreen,fullScreen,actionsProps,menuProps,...rest},ref)=>{
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
    },[])
    if(responsive && isFullScreen() || fullScreen){
        return null;
    }
    actionsProps = defaultObj(actionsProps);
    actionProps = Object.assign({},actionsProps.actionProps);
    actionProps.isModalDialogAction = true;
    rest = defaultObj(rest);
    const anchorStyle = flattenStyle([Colors.isValid(theme.text)? {color:theme.text}:null]);
    const menuActions = renderActions({...rest,...actionsProps,isAlert:isAlert,onAlertRequestClose,actionMutator,actionProps,cancelButton,actions,isFullScreen,fullScreen:false});
    
    menuProps = Object.assign({},menuProps);
    containerProps = defaultObj(containerProps);
    testID = testID||'DialogComponent_Actions';
    if(menuActions && (menuActions.actions.length || menuActions.menus.length)){
        return <View testID={testID} {...containerProps} style={[styles.container,containerProps.style]} ref={ref}>
            <DialogActions testID={testID+"_ActionsContainer"} {...rest} style={[styles.actions,rest.style]}>
                {menuActions.actions}
                {menuActions.menus.length ? <Menu
                    testID = {testID+"_MenuWrapper"}
                    {...menuProps}
                    anchorProps = {{
                        icon : MORE_ICON,
                        style : anchorStyle,
                        ...defaultObj(menuProps.anchorProps)
                    }}
                    items = {menuActions.menus}
                />: null}
            </DialogActions> 
        </View>
    }
    return null;
});

export default DialogActionsComponent;

DialogActionsComponent.displayName = "DialogActionsComponent";

const styles = StyleSheet.create({
    container : {
    },
    actions : {
        justifyContent : 'flex-end',
        marginLeft : 0,
        marginRight : 0,
        paddingHorizontal : 10,
    }
})