import Dialog from "./Dialog";
import React from "$react";
import {defaultObj,defaultBool} from "$utils";

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
    const {onDismiss,beforeOpen} = props;
    const ref = innerRef || createProviderRef();
    const [state,setState] = React.useState({
        visible : defaultBool(props.visible,false),
    });
    const [context] = React.useState({
        open : (props)=>{
            let bfOpen = typeof state.beforeOpen == 'function'? state.beforeOpen : typeof beforeOpen =='function'? beforeOpen : x=>true;
            if(bfOpen(state) === false) return;
            return setState({onDismiss:undefined,...defaultObj(props),visible:true})
        },
        close : (props)=>{
            return setState({...state,...props,visible:false});
        },
    });
    React.setRef(ref,context);        
    return <Dialog {...props} {...state} controlled onDismiss = {(e)=>{
        setState({...state,visible:false});
        if(typeof state.onDismiss =='function'){
            state.onDismiss({context,state});
        } else if(onDismiss){
            onDismiss({context,state});
        }
    }}/>
});
Provider.displayName = "DialogProviderComponent";

export default Provider;

Provider.open = open;

Provider.close = close;