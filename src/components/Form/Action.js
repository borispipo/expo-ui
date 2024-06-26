import React from "$react";
import PropTypes from "prop-types";
import Button from "$ecomponents/Button";
import notify from "$notify";
import FormsManager from "./utils/FormsManager";
import {uniqid} from "$cutils";
import { getFormInstance } from "./utils/FormsManager";
import {flattenStyle} from "$theme";
import APP from "$capp/instance";

const FormActionComponent = React.forwardRef(({
    formName,disabled:customDisabled,
    id:customId,Component,handleChange,isFormAction,children,style,isMenuItem,onPress,
    componentProps,innerRef,...rest},ref)=>{
    const isMounted = React.useIsMounted();
    componentProps = isObj(componentProps)? componentProps : {};
    rest = isObj(rest)? rest : {};
    const id = React.useRef(defaultStr(customId,uniqid("form-action-id"))).current;
    const [state,setState] = React.useState({
        disabled : typeof customDisabled =='boolean'? customDisabled : false,
    });
    const {disabled} = state;
    const [context] = React.useState({});
    context.getId = ()=> id;
    context.getFormName = x => formName;
    context.enable = ()=>{
        if(!isMounted()) return;
        setState({...state,disabled:false})
    }
    context.disable = ()=>{
        if(!isMounted()) return;
        setState({...state,disabled:true})
    }
    let _disabled = disabled;
    if(!disabled && formName){
        const f = getFormInstance(formName);
        if(!f || (!f.isValid || !f.isValid())){
            _disabled = true;
        }
    }
    context.isDisabled = x=> disabled ? true : false;
    context.isEnabled = x=> !context.isDisabled();
    context.toggleStatus = () =>{
        const f = getFormInstance(formName);
        if(f && f.isValid){
            const isValid = f.isValid();
            if(isValid){
                if(!context.isEnabled()){
                    context.enable();
                }
            } else if(!context.isDisabled()){
                context.disable();
            }
            return isValid;
        }
        return false;
    }
    React.setRef(ref,context);
    React.useEffect(()=>{
        FormsManager.trigger("mountAction",formName,context);
        const onMountForm = (nFormNmae)=>{
            if(nFormNmae == formName){
                context.toggleStatus();
            }
        };
        const onV = FormsManager.on("validate",onMountForm);
        const onNoV = FormsManager.on("novalidate",onMountForm);
        const onUpdate = FormsManager.on("update",onMountForm);
        APP.on("MOUNT_FORM",onMountForm);
        context.toggleStatus();
        return ()=>{
            React.setRef(ref,null);
            FormsManager.trigger("unmountAction",formName,id);
            APP.off("MOUNT_FORM",onMountForm);
            [onV,onNoV,onUpdate].map(v=>{
                if(typeof v?.remove =="function"){
                    v.remove();
                }
            });
            FormsManager.off("validate",onMountForm);
            FormsManager.off("novalidate",onMountForm);
            FormsManager.off("update",onMountForm);
        }
    },[formName]);
    const props = {
        ...rest,
        ...componentProps,
        style:flattenStyle([style,componentProps.style,_disabled?{pointerEvents:'none',cursor:'not-allowed'}:null]),
        disabled:_disabled,
        formName,
        id,
        isMenuItem,
        onPress : (event) =>{
            if(context.isDisabled()) {
                notify.error("Vous devez vous rassurer que les champs du formulaire sont tous valides");
                return;
            }
            const args = React.getOnPressArgs(event);
            if(!onPress) return;
            const formInstance = getFormInstance(formName);
            if(!formInstance || typeof formInstance.isValid != 'function' && isObj(formInstance.props)) return;
            if(formInstance.isValid()){
                onPress({...args,formInstance,form:formInstance,data:formInstance.getData({handleChange})})
            }
        }
    };
    if(typeof children ==='function'){
        return children(props);
    }
    Component = React.isComponent(props.Component) ? props.Component : React.isComponent(Component)? Component : Button;
    delete props.Component;
    delete props.formName;
    delete props.isAction;
    delete props.formName;
    return <Component ref = {innerRef} {...props}>{children}</Component>
});


FormActionComponent.propTypes = {
    /*** les forms doivent avoir un nom et ce nom doit être unique pour l'application */
    formName : PropTypes.string.isRequired,
    onPress : PropTypes.func,
    Component : PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType,
        PropTypes.node,
    ]),
}
FormActionComponent.displayName = "Form.Action";

export default FormActionComponent;