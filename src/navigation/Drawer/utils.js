import * as React from "react";
import {closeDrawer as close} from "$components/Drawer/utils";
let drawerRef = null;


export {drawerRef};

export const createDrawerRef = ()=>{
    const ref = React.useRef(null);
    React.useEffect(()=>{
        drawerRef = ref.current;
    },[ref.current]);
    return ref;
}

export const closeDrawer = (cb,force)=>{
    return close(drawerRef,cb,force);
}