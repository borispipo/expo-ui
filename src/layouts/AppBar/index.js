import AppBar from "$components/AppBar";
import { Appbar } from "react-native-paper";
import React from "$react";
import {MENU_ICON} from "$components/Icon";
import {defaultObj} from "$utils";
import {useDrawer} from "$components/Drawer";
import Icon from "$components/Icon";

export * from "./utils";

const AppBarLayout = React.forwardRef(({backActionProps,withDrawer,backAction,backActionRef,options,...props},ref)=>{
    const innerRef = React.useRef(null);
    options = defaultObj(options);
    const mergedRef = React.useMergeRefs(innerRef,ref);
    backActionProps = Object.assign({},backActionProps);
    const {drawerRef} = useDrawer();
    return <AppBar
        backAction = {backAction === false ? null : ({back,...props})=>{
            props = defaultObj(props);
            const size = 30;
            const bProps = {
                size,
                //color : theme.colors.primaryText,
                ...backActionProps,
                ...props,
            }
            return backAction === true ? <Appbar.BackAction {...bProps}/> : withDrawer !== false? <Icon {...bProps} icon = {MENU_ICON}/> : null;
        }}
        {...props}
        onBackActionPress = {(args)=>{
            const {canGoBack,goBack} = args;
            if(backAction === true && canGoBack()){
                goBack();
                return false;
            }
            if(drawerRef && drawerRef.current){
                if(drawerRef.current.isMinimized() && drawerRef.current.isOpen()){
                    drawerRef.current.restore();
                    return false;
                }
                if(!drawerRef.current.isPermanent()){
                    drawerRef.current.toggle();
                } else if(!drawerRef.current.isOpen()){
                    drawerRef.current.open();
                }
            }
            return false;
        }}
        ref = {mergedRef}
    />
});

AppBarLayout.displayName = "AppBarLayout";

AppBarLayout.propTypes = {
    ...AppBar.propTypes,
}

export default AppBarLayout;