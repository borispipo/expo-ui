import Dialog from "./Dialog";
import React from "$react";
import {defaultObj,defaultBool} from "$cutils";

let dialogRef = null;

export const createProviderRef = (cb)=>{
    const ref = React.useRef(null);
    React.useEffect(()=>{
        if(typeof cb =='function'){
            cb(ref.current);
        } else if(cb !== false) {
            dialogRef = ref.current;
        }
    },[ref.current])
    return ref;
};

export const getProviderRef = ()=> dialogRef;

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
    const ref = innerRef || createProviderRef();
    const [visible,setVisible] = React.useState(defaultBool(props.visible,false));
    const [state,setState] = React.useState({});
    const context = {
        open : (props)=>{
            if(visible) {
                return;
            }
            if(!visible){
                setVisible(true);
            }
            setState(defaultObj(props));
        },
        close : ()=>{
            if(!visible) return;
            setVisible(false);
        },
    };
    React.setRef(ref,context);        
    return <Dialog {...props} {...state} visible={visible} controlled onDismiss = {(e)=>{
        if(visible){
            setVisible(false);
        }
    }}/>
});
Provider.displayName = "DialogProviderComponent";

export default Provider;

Provider.open = open;

Provider.close = close;