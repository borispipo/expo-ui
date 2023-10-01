import {isDecimal,isObj,defaultObj,extendObj,isNonNullString,isArray,defaultFunc,defaultStr,defaultVal} from "$cutils";
import {getTheme,flattenStyle} from "$theme";
import React from "$react";
import {NotificationManager} from 'react-notifications';

export default function showConfirm (p,cb){
    let {
        yes,
        title,
        text,
        defaultValue,
        message,
        msg,
        onCancel,
        onSuccess,
        alert,
        ok,
        prompt,
        confirm,
        no,
        type,
        alertType,
        buttons,
        ...options
    } = defaultObj(p);
    const theme = getTheme();
    if(isDecimal(text)){
        text = text+"";
    }
    title = defaultStr(title)

    if(isNonNullString(no)){
        no = {text:no}
    }
    if(isNonNullString(yes)){
        yes = {text:yes}
    }
    if(buttons !== false && buttons !== null){
        if(!isArray(buttons)){
            buttons = [];
        }    
        no = defaultObj(no)
        if(!alert && no !== false){
            no.text  = defaultStr(no.text,'Non')
            no.style = flattenStyle([{color:theme.colors.onSecondary,backgroundColor:theme.colors.secondary},no.style]);
            buttons.push(no);
        } else no = null;
        if(yes !== false){
            yes = defaultObj(yes,ok)
            yes.text = defaultStr(yes.text,alert?'OK':'Oui');
            yes.style = flattenStyle([{color:theme.colors.onPrimary,backgroundColor:theme.colors.primary},yes.style]);
            buttons.push(yes);
        }
    } else {
        buttons = [];
    }
    message = defaultVal(message,msg)
    options = defaultObj(options);
    if(isObj(yes)){
        options.okButtonProps = extendObj(true,{},options.okButtonProps,yes);
        options.okText = defaultVal(options.okText,yes.text,yes.label);
    }
    if(isObj(no)){
        options.cancelButtonProps = extendObj(true,{},options.cancelButtonProps,no);
        options.cancelText = defaultVal(options.cancelText,no.text,no.label);
        options.closeIcon = React.isValidElement(no.icon)? no.icon : options.closeIcon;
    }
    //options.closeIcon = React.isValidElement(options.closeIcon)? options.closeIcon : <CloseOutlined />
    options.onOk = defaultFunc(onSuccess,cb);
    options.onCancel = onCancel;
    if(alert){
        options.closable = confirm? false : true;
        type = "info";
    }
    type = defaultStr(alertType,type,"confirm").toLowerCase().trim();
    const cB = defaultFunc(NotificationManager[type],NotificationManager.confirm);
    return cB(message,title);
    return cB({
        ...options,
        content : message,
        title,
        onCancel,
    })
}
