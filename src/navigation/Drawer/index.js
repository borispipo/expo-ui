import Drawer,{DrawerItems} from "$ecomponents/Drawer";
import ProfilAvatar from "$elayouts/ProfilAvatar";
import React from "$react";
import useGetItems,{isItemActive} from "./items";
import APP from "$capp/instance";
import Auth from "$cauth";
import Login from "$eauth/Login";
import {navigate} from "$cnavigation";
import theme from "$theme";
import Logo  from "$ecomponents/Logo";

const DrawerNavigator = React.forwardRef(({content,children,state,...props},ref)=>{
    const drawerRef = React.useRef(null);
    const mergedRefs = React.useMergeRefs(drawerRef,ref);
    const forceRender = React.useForceRender();
    const refreshItemsRef = React.useRef(false);
    const items = useGetItems({refresh:()=>{
        if(drawerRef.current && drawerRef.current && drawerRef.current.forceRenderNavigationView){
            return  drawerRef.current.forceRenderNavigationView();
        }
    },force:refreshItemsRef.current});
    React.useEffect(()=>{
        const onLogoutUser = ()=>{
            setIsLoggedIn(false);
        }
        const refreshItems = ()=>{
            refreshItemsRef.current = true;
            forceRender();
            refreshItemsRef.current = false;
        };
        APP.on(APP.EVENTS.AUTH_LOGOUT_USER,onLogoutUser);
        APP.on(APP.EVENTS.UPDATE_THEME,refreshItems);
        return ()=>{
            APP.off(APP.EVENTS.AUTH_LOGOUT_USER,onLogoutUser);
            APP.off(APP.EVENTS.UPDATE_THEME,refreshItems);
        }
    },[])
    const headerCB = ({isMinimized})=>{
        if(isMinimized) return null;
        if(!theme.showProfilAvatarOnDrawer){
            return <Logo height = {70} withImage = {false} style={[theme.styles.justifyContentFlexStart,{maxWidth:220,overflow:'hidden'}]}/>
        }
        return <ProfilAvatar ref={uProfileRef} drawerRef={drawerRef}/>;
    };
    const isAuthLoggedIn = Auth.isLoggedIn();
    const [isLoggedIn,setIsLoggedIn] = React.useState(isAuthLoggedIn);
    const prevIsLoggedIn = React.usePrevious(isLoggedIn);
    const navigationViewRef = React.useRef(null);
    state = defaultObj(state);
    const itemRefs = React.useRef(null);
    const uProfileRef = React.useRef(null);
    React.useEffect(()=>{
        if(prevIsLoggedIn === isLoggedIn) return;
        navigate("Home");
    },[isLoggedIn]);
    if(!isLoggedIn) {
        return <Login withPortal
            onSuccess = {(data)=>{
                setIsLoggedIn(true);
            }}
        />
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
export * from "./items";