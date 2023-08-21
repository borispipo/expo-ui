import ErrorMessage from "./ErrorMessage";
import {Portal} from "react-native-paper";
let providerRef = null;
import * as React from "react";
import useForceRender from "$react/useForceRender";
import setRef from "$react/setRef";
import {defaultStr} from "$cutils";

const providerState = {};

export const createProviderRef = (cb)=>{
    const ref = React.useRef(null);
    React.useEffect(()=>{
        if(typeof cb =='function'){
            cb(ref.current);
        } else if(cb !== false) {
            providerRef = ref.current;
        }
    },[ref.current])
    return ref;
};

export const getProviderRef = ()=> providerRef;

const Provider = React.forwardRef((_props,innerRef)=>{
    const ref = innerRef || createProviderRef();
    const propRef = React.useRef(_props);
    const forceRender = useForceRender();
    const messageRef = React.useRef(null);
    const [context] = React.useState({
        open : (props)=>{
           if(typeof props =='object' && props){
             propRef.current = props;
             forceRender();
           }
        },
        isOpen : x=> {
            return messageRef.current && messageRef.current? true : false
        },
    });
    setRef(ref,context);        
    const testID = defaultStr(propRef.current?.testID,_props.testID,"RN_ErrorBoundaryProvider");
    return <Portal testID={testID}>
        <ErrorMessage {...propRef.current} testID={testID+"_ErrorBoundaryPortalContent"}  ref={el=>{
            messageRef.current = el;
            setRef(propRef.current.messageRef);
        }}/>
    </Portal>
});

Provider.displayName = "ErrorBoundaryProvider";


export default Provider;

export const isOpen = ()=>{
    const ref = getProviderRef();
    if(ref && typeof ref.isOpen =='function') return ref.isOpen();
    return false;
}
export const isClosed = x=> !isOpen();


export const open = (props)=>{
    const ref = getProviderRef();
    if(ref && typeof ref.open =='function') return ref.open(props);
    return false;
}