import Drawer from "./Drawer";
import React from "$react";
import {View,StyleSheet} from "react-native";
let drawerRef = null;

export const createProviderRef = (cb)=>{
    const ref = React.useRef(null);
    React.useEffect(()=>{
        if(typeof cb =='function'){
            cb(ref.current);
        } else if(cb !== false) {
            drawerRef = ref.current;
        }
    },[ref.current])
    return ref;
};

export const getProviderRef = ()=> drawerRef;

export const open = (props,innerProviderRef)=>{
    innerProviderRef = innerProviderRef || getProviderRef();
    if(!innerProviderRef) return false;
    if(innerProviderRef.current && innerProviderRef.current.open){
        innerProviderRef = innerProviderRef.current;
    }
    if(innerProviderRef && typeof innerProviderRef.open =='function') {
        return innerProviderRef.open(props);
    }
    return false;
}

export const close = (props,innerProviderRef)=>{
    innerProviderRef = innerProviderRef || getProviderRef();
    if(!innerProviderRef) return false;
    if(innerProviderRef.current && innerProviderRef.current.open){
        innerProviderRef = innerProviderRef.current;
    }
    if(innerProviderRef && typeof innerProviderRef.close =='function') return innerProviderRef.close(props);
    return false;
}

const Provider = React.forwardRef((props,innerRef)=>{
    return <Drawer
        ref = {innerRef || createProviderRef()}
        position="right" 
        sessionName = {sessionName} 
        {...props}
        permanent={false}
        isPortal
    />
});

const sessionName = "custom-drawer-provider-right";

Provider.displayName = "DrawerProviderComponent";

export default Provider;

Provider.open = open;

Provider.close = close;

Provider.sessionName = sessionName;

const styles = StyleSheet.create({
    visible : {
        opacity : 1,
        ...StyleSheet.absoluteFill,
    },
    notVisible : {
        opacity : 0,
    }
})