import React from "$react";
import Dialog from "./Dialog";
import { createProviderRef } from "$ecomponents/Dialog/Provider";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import {MAX_WIDTH} from "$ecomponents/Dialog/utils";
import {extendObj,defaultObj,isObj,defaultBool,defaultStr,defaultVal} from "$cutils";
import grid from "$theme/grid";
import theme from "$theme";
import {isDesktopMedia} from "$cdimensions";

let dialogProviderRef = null;


/*** l'on peut override par défaut l'action ok par les props ok|yes
    l'on peut override par défaut l'acction cancel par les props closeAction|no
*/
const FormDataDialogProvider = React.forwardRef((props,innerRef)=>{
    innerRef = innerRef || createProviderRef((eRef)=>{
        dialogProviderRef = eRef;
    });
    const [visible,setVisible] = React.useState(false);
    const [state,setState] = React.useState({});
    const isMobile = isMobileOrTabletMedia();
    const formRef = React.useRef(null);
    const {closeAction} = props;
    const context = {
        open : (props)=>{
            let sData = {};
            if(formRef.current && formRef.current.formDataContext && formRef.current.formDataContext.getData){
                sData.data = formRef.current.formDataContext.getData();
            }
            if(!visible){
                setVisible(true);
            }
            setState({...sData,...defaultObj(props)});
        },
        close : ()=>{
            if(!visible) return;
            setVisible(false);
        },
    };
    React.setRef(innerRef,context);       
    const dialogProps = extendObj({},props.dialogProps,state.dialogProps,{hiddenControlled:true});
    const formProps = defaultObj(state.formProps);
    if(state.visible){
        formProps.fieldProps = defaultObj(formProps.fieldProps);
        formProps.fieldProps.windowWidth = !isMobile ? MAX_WIDTH : undefined;
        formProps.fieldProps.mediaQueryUpdateStyle = ({target})=>{
            if(!formRef.current || !formRef.current.dialogRef || !formRef.current.dialogRef.current || !formRef.current.dialogRef.current.isFullScreen) return;
            const f = formRef.current.dialogRef.current.isFullScreen();
            return f ? grid.col() : {width:'100%'};
        }
    }
    return <Dialog 
        responsive
        withScrollView
        subtitle ={false}
        {...props} 
        {...state} 
        visible = {visible}
        formProps = {formProps}
        isProvider
        ref={formRef}  
        windowWidth = {MAX_WIDTH}
        propsMutator = {({cancelButton,...rest})=>{
            const isMob = isMobileOrTabletMedia();
            if(closeAction === true || state.closeAction === true) return rest;
            rest.windowWidth = !isMob ? MAX_WIDTH : undefined;
            const no = extendObj({},props.no,state.no);
            rest.actions = Array.isArray(rest.actions)? Object.clone(rest.actions) : isObj(rest.actions)? Object.clone(rest.actions) : null;
            const closeAction = defaultObj(closeAction);
            rest.cancelButton = false;
            if(cancelButton !== false && rest.actions && (!isMob || rest.fullScreen === false) && state.no !== false){
                if(isDesktopMedia() && typeof rest.maxActions !=='number'){
                    rest.maxActions = 2;
                }
                const noText = defaultVal(no.text,no.label,closeAction.text,closeAction.label,'Annuler')
                const closeBtn ={
                    ...closeAction,
                    ...no,
                    text : noText,
                    label : noText,
                    icon : defaultVal(no.icon,closeAction.icon,'close'),
                    isCancelButton : true,
                    error : true,
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
            if(visible){
                setVisible(false);
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