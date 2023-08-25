import {Menu} from "$ecomponents/BottomSheet";
import React from "$react";
import {defaultObj} from "$cutils";

let bottomSheetRef = null;

export const createProviderRef = ()=>{
    const ref = React.useRef(null);
    React.useEffect(()=>{
        bottomSheetRef = ref.current;
    },[ref.current])
    return ref;
};

export const getProviderRef = ()=> bottomSheetRef;

export const open = (props)=>{
    const ref = getProviderRef();
    if(ref && typeof ref.open =='function') return ref.open(props);
    return false;
}

export const close = (props)=>{
    const ref = getProviderRef();
    if(ref && typeof ref.close =='function') return ref.close(props);
    return false;
}

const Provider = React.forwardRef((props,innerRef)=>{
    const ref = innerRef || createProviderRef();
    const [visible,setVisible] = React.useState(false);
    const [state,setState] = React.useState({});
    const context = {
        open : (props)=>{
            if(!visible){  
                setVisible(true);
            }
            setState(defaultObj(props));
        },
        close : ()=>{
            if(visible) return;
            setVisible(false);
        }
    };
    React.setRef(ref,context);        
    return <Menu {...props} {...state} visible={visible} sheet controlled onDismiss = {(...args)=>{
        if(visible){
            setVisible(false);
        }
        if(typeof state.onDismiss =='function'){
            state.onDismiss(...args)
        } else if(typeof props.onDismiss =='function'){
            props.onDismiss(...args);
        }
    }}/>
});

Provider.getProviderRef = getProviderRef;
Provider.displayName = "BottomSheetProviderComponent";

export default Provider;