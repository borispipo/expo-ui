import Drawer,{DrawerItems} from "$ecomponents/Drawer";
import ProfilAvatar from "./ProfilAvatar";
import React from "$react";
import items,{isItemActive,refresh as refreshItems} from "./items";
import APP from "$capp/instance";
import Auth from "$cauth";
import Login from "$eauth/Login";
import {navigate} from "$enavigation/utils";

const DrawerNavigator = React.forwardRef(({content,children,state,...props},ref)=>{
    const drawerRef = React.useRef(null);
    const mergedRefs = React.useMergeRefs(drawerRef,ref);
    const headerCB = ({isMinimized})=>{
        return isMinimized ? null : <ProfilAvatar ref={uProfileRef} drawerRef={drawerRef}/>;
    };
    const isAuthLoggedIn = Auth.isLoggedIn();
    const [isLoggedIn,setIsLoggedIn] = React.useState(isAuthLoggedIn);
    const prevIsLoggedIn = React.usePrevious(isLoggedIn);
    const navigationViewRef = React.useRef(null);
    state = defaultObj(state);
    const itemRefs = React.useRef(null);
    const uProfileRef = React.useRef(null);
    React.useEffect(()=>{
        const onRefreshItems = (a)=>{
            refreshItems();
            if(drawerRef.current && drawerRef.current && drawerRef.current.forceRenderNavigationView){
                return  drawerRef.current.forceRenderNavigationView();
            }
        }
        const onLoginUser = ()=>{
            onRefreshItems();
        }
        const onLogoutUser = ()=>{
            setIsLoggedIn(false);
        }
        APP.on(APP.EVENTS.REFRESH_MAIN_DRAWER,onRefreshItems);
        APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
        APP.on(APP.EVENTS.AUTH_LOGOUT_USER,onLogoutUser);
        return ()=>{
            APP.off(APP.EVENTS.REFRESH_MAIN_DRAWER,onRefreshItems);
            APP.off(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
            APP.off(APP.EVENTS.AUTH_LOGOUT_USER,onLogoutUser);
        }
    },[]);
    React.useEffect(()=>{
        if(prevIsLoggedIn === isLoggedIn) return;
        navigate("Home");
    },[isLoggedIn])
    if(!isLoggedIn) {
        return <Login withPortal/>
    }
    return <Drawer
        isItemActive = {isItemActive}
        {...props}
        navigationViewRef = {navigationViewRef}
        sessionName = "main-drawer-drawer-navigator"
        ref = {mergedRefs}
        header = {headerCB}
        content = {({sessionManager,isMinimized,context})=>{
            return <DrawerItems
                ref = {itemRefs}
                items = {items}
                minimized = {isMinimized}
                sessionManager = {sessionManager}
                drawerRef = {context}
            />
        }}
    >
        {children}
    </Drawer>
});

DrawerNavigator.displayName = "DrawerNavigator"

DrawerNavigator.propTypes = {
    ...Drawer.propTypes,
}

export default DrawerNavigator;

export * from "./utils";