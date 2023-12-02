import AppBar from "$ecomponents/AppBar";
import { Appbar } from "react-native-paper";
import React from "$react";
import {MENU_ICON} from "$ecomponents/Icon";
import {defaultObj} from "$cutils";
import {useDrawer} from "$ecomponents/Drawer";
import Icon from "$ecomponents/Icon";
import {useGetComponent} from "$econtext/hooks";
import {navigate as cNavigate,sanitizeName} from "$cnavigation";
import { StackActions } from '@react-navigation/native';

export * from "./utils";

const AppBarLayout = React.forwardRef(({backActionProps,withDrawer,withNotifications,backAction,backActionRef,options,...props},ref)=>{
    const innerRef = React.useRef(null);
    const {drawerRef} = useDrawer();
    options = defaultObj(options);
    const mergedRef = React.useMergeRefs(innerRef,ref);
    const Notifications = useGetComponent('Notifications');
    return <AppBar
        backAction = {getBackActionComponent({backAction,backActionProps,withDrawer})}
        Notifications = {withNotifications? Notifications:null}
        {...props}
        onBackActionPress = {(args)=>{
            const {canGoBack,navigation,goBack} = args;
            if(typeof props.onPress ==='function' && props.onPress(args) === false) return false;
            if((backAction === true || backActionProps?.back === true)){
                if(canGoBack()){
                    goBack();
                    return false;
                }
                const home = sanitizeName("Home");
                console.log(navigation," is navigation heeee ",args);
                if(typeof navigation?.dispatch =='function'){
                    try {
                        navigation.dispatch(StackActions.popToTop());
                    } catch(e){
                        console.log(e," has générated errordd for navigation");
                        //cNavigate(home);
                    }
                }
                return false;
            }
            if(!drawerRef || !drawerRef?.current) return false;
            if(!drawerRef?.current?.isOpen()){
                drawerRef.current.toggle();
                return false;
            }
            if(drawerRef?.current?.isMinimized()){
                drawerRef?.current?.restore();
                return false;
            }
            if(!drawerRef?.current?.isPermanent()){
                drawerRef?.current?.toggle();
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