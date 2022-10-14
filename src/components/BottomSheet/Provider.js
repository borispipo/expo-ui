import {Menu} from "$ecomponents/BottomSheet";
import React from "$react";
import {defaultObj} from "$utils";

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
    const {onDismiss} = props;
    const ref = innerRef || createProviderRef();
    const [state,setState] = React.useState({
        visible : false,
    });
    const context = {
        open : (props)=>{
            return setState({onDismiss:undefined,...defaultObj(props),visible:true})
        },
        close : (props)=>{
            return setState({...state,...defaultObj(props),visible:false})
        }
    };
    React.setRef(ref,context);        
    return <Menu {...props} {...state} sheet controlled onDismiss = {(e)=>{
        setState({...state,visible:false});
        if(typeof state.onDismiss =='function'){
            state.onDismiss({context,state})
        } else if(onDismiss){
            onDismiss({context,state});
        }

    }}/>
});

Provider.getProviderRef = getProviderRef;
Provider.displayName = "BottomSheetProviderComponent";

export default Provider;