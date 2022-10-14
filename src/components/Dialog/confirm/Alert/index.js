import DialogProvider from "../../Provider";
import React from "$react";

let SimpleSelect = null;

const dialogRef = React.createRef(null);

const onAlertRequestClose = (args)=>{
    close(args);
    return true;
}

export function open(props){
    return DialogProvider.open({
        ...props,
        isAlert : true,
        onAlertRequestClose,
    },dialogRef);
}

export const close = (props)=>{
    return DialogProvider.close(props,dialogRef);
}

export const Provider = ({SimpleSelect:customSimpleSelect,...props})=>{
    if(!SimpleSelect && customSimpleSelect){
        SimpleSelect = customSimpleSelect;
    }
    return <DialogProvider {...props} isAlert onAlertRequestClose={onAlertRequestClose} ref={dialogRef}/>
}

const Alert = {
    open,
    close,
    get SimpleSelect (){
        return SimpleSelect
    },
    alert : open,
    prompt : (args)=>{
      return open({...defaultObj(args),prompt:true});   
    },
}
export default Alert;