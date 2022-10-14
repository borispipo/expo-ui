import showConfirmOrAlertOrPrompt from "./showConfirmOrAlertOrPrompt";
export const showAlert = (props,cb)=>{
    return showConfirmOrAlertOrPrompt({...defaultObj(props),alert:true,confirm:false,prompt:false},cb)
}
export const showConfirm = (props,cb)=>{
    return showConfirmOrAlertOrPrompt({...defaultObj(props),alert:false,confirm:true,prompt:false},cb)
}
export const showPrompt = (props,cb)=>{
    return showConfirmOrAlertOrPrompt({...defaultObj(props),prompt:true,alert:false,confirm:false},cb)
};

export default showConfirm;
