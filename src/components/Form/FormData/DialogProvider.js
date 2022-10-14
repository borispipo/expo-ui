import React from "$react";
import Dialog from "./Dialog";
import { createProviderRef } from "$components/Dialog/Provider";
import {isMobileOrTabletMedia} from "$platform/dimensions";
import {MAX_WIDTH} from "$components/Dialog/utils";
import {extendObj,defaultObj,isObj,defaultBool,defaultStr} from "$utils";
import grid from "$theme/grid";

let dialogProviderRef = null;


const FormDataDialogProvider = React.forwardRef((props,innerRef)=>{
    innerRef = innerRef || createProviderRef((eRef)=>{
        dialogProviderRef = eRef;
    });
    const [state,setState] = React.useState({
        visible : false,
    });
    const isMobile = isMobileOrTabletMedia();
    const formRef = React.useRef(null);
    const {closeAction,onDismiss} = props;
    const context = {
        open : (props)=>{
            let sData = {};
            if(formRef.current && formRef.current.formDataContext && formRef.current.formDataContext.getData){
                sData.data = formRef.current.formDataContext.getData();
            }
            return setState({...state,...sData,onDismiss:undefined,...defaultObj(props),visible:true})
        },
        close : (props)=>{
            setState({...state,...defaultObj(props),visible:false});
        },
    };
    React.setRef(innerRef,context);       
    const dialogProps = extendObj({},props.dialogProps,state.dialogProps,{hiddenControlled:true});
    const formProps = defaultObj(state.formProps);
    if(state.visible){
        formProps.fieldProps = defaultObj(formProps.fieldProps);
        formProps.fieldProps.windowWidth = !isMobile ? MAX_WIDTH : undefined;
        formProps.fieldProps.updateNativePropsOnUpdate = ({target})=>{
            if(!target || !target.current || target.setNativeProps || !formRef.current || !formRef.current.dialogRef || !formRef.current.dialogRef.current || !formRef.current.dialogRef.current.isFullScreen) return;
            const f = formRef.current.dialogRef.current.isFullScreen();
            target.current.setNativeProps({ style : f? grid.col() : {width:'100%'}});
        }
    }
    return <Dialog 
        responsive
        withScrollView
        {...props} 
        {...state} 
        formProps = {formProps}
        isProvider
        ref={formRef}  
        windowWidth = {MAX_WIDTH}
        propsMutator = {(rest)=>{
            const isMob = isMobileOrTabletMedia();
            if(closeAction === true || state.closeAction === true) return rest;
            rest.windowWidth = !isMob ? MAX_WIDTH : undefined;
            rest.actions = Array.isArray(rest.actions)? [...rest.actions] : isObj(rest.actions)? {...rest.actions} : null;
            if(rest.actions && (!isMob || rest.fullScreen === false)){
                if(isDesktopMedia() && typeof rest.maxActions !=='number'){
                    rest.maxActions = 2;
                }
                const closeBtn ={
                    text : 'Annuler',
                    icon : 'close',
                    secondary : true,
                    ...defaultObj(closeAction),
                    onPress : context.close,
                    isAction : false,
                } 

                Array.isArray(rest.actions)? rest.actions.push(closeBtn) : isObj(rest.actions)? rest.actions ["close-bn-dddsdd"] = closeBtn : undefined;
            }
            return rest;
        }}
        dialogProps = {dialogProps}
        controlled={false} 
        onDismiss = {(e)=>{
            setState({...state,visible:false});
            if(typeof state.onDismiss =='function'){
                state.onDismiss({context,state});
            } else if(onDismiss){
                onDismiss({context,state});
            }
        }}
        open = {context.open}
        close = {context.close}
    />
});

FormDataDialogProvider.open = (props,innerProviderRef)=>{
    innerProviderRef = innerProviderRef || dialogProviderRef;
    if(!innerProviderRef) return;
    if(innerProviderRef.current && innerProviderRef.current.open){
        innerProviderRef = innerProviderRef.current;
    }
    if(innerProviderRef && typeof innerProviderRef.open =='function') {
        return innerProviderRef.open(props);
    }
    return false;
}

FormDataDialogProvider.close = (props,innerProviderRef)=>{
    innerProviderRef = innerProviderRef || dialogProviderRef;
    if(!innerProviderRef) return;
    if(innerProviderRef.current && innerProviderRef.current.open){
        innerProviderRef = innerProviderRef.current;
    }
    if(innerProviderRef && typeof innerProviderRef.close =='function') return innerProviderRef.close(props);
    return false;
}

FormDataDialogProvider.displayName = "FormDataFormDataDialogProviderComponent";


export default FormDataDialogProvider;