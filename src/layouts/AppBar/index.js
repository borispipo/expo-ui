import AppBar from "$ecomponents/AppBar";
import { Appbar } from "react-native-paper";
import React from "$react";
import {MENU_ICON} from "$ecomponents/Icon";
import {defaultObj} from "$cutils";
import {useDrawer} from "$ecomponents/Drawer";
import Icon from "$ecomponents/Icon";

export * from "./utils";

const AppBarLayout = React.forwardRef(({backActionProps,withDrawer,backAction,backActionRef,options,...props},ref)=>{
    const innerRef = React.useRef(null);
    const {drawerRef} = useDrawer();
    options = defaultObj(options);
    const mergedRef = React.useMergeRefs(innerRef,ref);
    return <AppBar
        backAction = {getBackActionComponent({backAction,backActionProps,withDrawer})}
        {...props}
        onBackActionPress = {(args)=>{
            const {canGoBack,goBack} = args;
            if(typeof props.onPress ==='function' && props.onPress(args) === false) return false;
            if((backAction === true || backActionProps?.back === true) && canGoBack()){
                goBack();
                return false;
            }
            if(drawerRef && drawerRef?.current){
                if(drawerRef?.current?.isMinimized() && drawerRef?.current?.isOpen()){
                    drawerRef?.current?.restore();
                    return false;
                }
                if(!drawerRef?.current?.isPermanent()){
                    drawerRef?.current?.toggle();
                } else if(!drawerRef?.current?.isOpen()){
                    drawerRef?.current?.open();
                }
            }
            return false;
        }}
        ref = {mergedRef}
    />
});

export const getBackActionComponent = ({backAction,backActionProps,withDrawer})=>{
    backActionProps = Object.assign({},backActionProps);
    return function MainDrawerBackAction({...props}){
        const {drawerRef} = useDrawer();
        const size = 30;
        const bProps = {
            size,
            ...backActionProps,
            ...props,
        }
        if(backAction === true) return <Appbar.BackAction {...bProps}/>;
        const isPermanent = typeof drawerRef?.current?.isPermanent =='function' && drawerRef?.current?.isPermanent(); 
        const isMinimized = typeof drawerRef?.current?.isMinimized =="function" && drawerRef?.current?.isMinimized();
        if(backAction === false || withDrawer === false) return null;
        const hasRightPosition = typeof drawerRef?.current?.hasRightPosition =="function" && drawerRef?.current?.hasRightPosition();
        if(isMinimized){
            bProps.style =[bProps.style];
            if(hasRightPosition){
                bProps.style.push({marginRight:-10});
            } else bProps.style.push({marginLeft:-10});
            bProps.title = "Cliquez pour restaurer le drawer à sa position initiale"
        }
        return !isPermanent || isMinimized ? <Icon {...bProps} icon = {isMinimized ? `chevron-${hasRightPosition?"left":"right"}` : MENU_ICON}/> : null
    }
}

AppBarLayout.displayName = "AppBarLayout";

AppBarLayout.propTypes = {
    ...AppBar.propTypes,
}

export default AppBarLayout;