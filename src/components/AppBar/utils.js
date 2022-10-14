import {isPlainObj,defaultFunc,defaultStr,isObjOrArray,isObj,defaultObj} from "$utils";
import {getWindowSizes,isMobileOrTabletMedia,isMobileMedia} from "$dimensions";
import { StyleSheet } from "react-native";
import Button from "$ecomponents/Button";
import React from "$react";
import theme from "$theme"
import Action from "$ecomponents/Form/Action";
import Menu from "$ecomponents/Menu";
import Icon,{ MORE_ICON } from "$ecomponents/Icon";

export const ACTION_ICON_SIZE = 30;

export const TITLE_FONT_SIZE = 16;

export const getMaxActions = (windowWidth) => {
    let iWidth = typeof windowWidth =='number' && windowWidth > 200 ? windowWidth : getWindowSizes().width;
    return iWidth >= 3000 ? 8 : iWidth >= 2500? 7 : iWidth >= 2000 ? 6 : iWidth >= 1600 ? 5 : iWidth >= 1300 ? 4 : iWidth >= 800 ? 2 : iWidth >= 600 ? 1 : 0
}

export const isSplitedActions = (actions)=> isObj(actions) && Array.isArray(actions.actions) && Array.isArray(actions.menus);

const renderAction = ({action,isAlert,actionProps,opts,isAppBarAction,isAppBarActionStyle,key,ActionComponent,isMobile}) => {
    let {Component,isFormAction,...rest} = action;
    actionProps = defaultObj(actionProps);
    rest = Object.assign({},rest);
    rest.accessibilityLabel = defaultStr(rest.accessibilityLabel,rest.title,rest.text,rest.label,rest.children);
    const color = theme.colors.primaryText;
    rest.style = {...defaultObj(StyleSheet.flatten(actionProps.style)),elevation:0,...defaultObj(StyleSheet.flatten(rest.style))};
    if(isAppBarActionStyle !== false && (isAppBarAction || opts.isAppBarAction)){
        rest.color = defaultVal(color);
        rest.style.color = defaultVal(rest.style.color,color)
    }
    if(isAppBarAction && isMobile){
        rest.tooltip = defaultVal(rest.title,rest.label,rest.text);
        delete rest.title;
        delete rest.label;
        delete rest.text;
        ActionComponent = Icon;
    } else {
        ActionComponent = Component || ActionComponent;
        if(!isAlert && rest.style.marginRight === undefined){
            rest.style.marginRight = 10;
        }
        if(opts.isFullScreenDialog ===false){
            rest.mode = rest.mode !== undefined ? rest.mode : actionProps.mode !==undefined ? actionProps.mode : 'contained';
        }
        rest.children = defaultVal(rest.children,rest.label,rest.text,rest.accessibilityLabel);
    }
    if(isFormAction){
        actionProps.componentProps = defaultObj(actionProps.componentProps)
        actionProps.componentProps.Component = ActionComponent;
        ActionComponent = Action;
    }
    key = key || action.key;
    return <ActionComponent {...actionProps} isAppBarAction={isAppBarAction} key = {key} {...rest}/>
}

/*** cette fonction a pour but de prendre les actions qui irons sur la barre de navigation
 *  puis les subdivisenst en fonction de la taille, en une parties des actions directement visible dans le resultat actions
 *  et une autre partie qui sera rendu visible par un menu, accessible via un menu moreVert
 *  ///alwaysSplitOnMobile : PropoTypes.bool
 * @param alwaysSplitOnMobile {boolean}, si les actions serton toujours éclatées en un menu d'action en environnement mobile, quel qu'en soit le nombre d'actions trouvées
 * 
 */
export const splitActions = (args)=>{
    let {actions,actionProps,alwaysSplitOnMobile,actionMutator,isAlert,onAlertRequestClose,maxActions,isAppBarActionStyle,cancelButton,...opts} = defaultObj(args)
    if(isSplitedActions(actions)) {
        return actions;
    }
    if(!isObjOrArray(actions)){
        return {actions:[],menus:[]};
    }
    actionMutator = defaultFunc(actionMutator,({action,actions})=> action);
    if(isAlert){
        onAlertRequestClose = defaultFunc(onAlertRequestClose);
    }
    opts = defaultObj(opts);
    const isMobile = isMobileOrTabletMedia();
    const isAppBarAction = opts.isAppBarAction && isMobile ? true : false;
    const ActionComponent = isAppBarAction ? Icon : Button;
    let menus = []
    let _actions = [];
    let countActions = 0;
    if(maxActions !== 0 && typeof maxActions =='number'){
        maxActions = maxActions > 0 ? Math.trunc(maxActions): getMaxActions(opts.windowWidth);
    } else if(maxActions !=0){
        maxActions = getMaxActions(opts.windowWidth);
    } 
    for(let i in actions){
        let act = actions[i];
        let cEl = null;
        if(!React.isValidElement(act)&& isPlainObj(act)){
            let {label,perm,text,...action} = act;
            if(typeof perm =='function' && perm(args) === false){
                continue;
            }
            action = {...defaultObj(action)};
            if(isAppBarAction && !action.icon) {
                console.log("not icon found for appbar action ",action," you must specity icon for this action");
                continue;
            }
            action.key = defaultVal(action.key,i)
            action.text = defaultVal(text,label)
            action.isAlert = isAlert;
            const _action = actionMutator({action,key:action.key,actions});
            if(isObj(_action)){
                if(!_action.divider && !_action.text && !_action.label && !_action.title && !_action.icon && !_action.Component) continue;
                const {onPress} = _action;
                _action.onPress = (args)=>{
                    args = {...opts,...React.getOnPressArgs(args),isAlert};
                    if(isAlert){
                        args.closeAlert = args.closeDialog = onAlertRequestClose;
                    }
                    if(onPress){
                        return onPress(args);
                    }
                    return false;
                }
                cEl = _action;
                countActions++;
            }
        } 
        if(cEl){    
            if(countActions >= maxActions+1) countActions = maxActions+1;
            if((countActions <= maxActions && maxActions >1)){
                _actions.push(renderAction({actionProps,isAlert,isAppBarAction,isAppBarActionStyle,opts,action:cEl,isMenuItem:false,isMobile,ActionComponent}));  
            } else {
                menus.push({...cEl,isMenuItem:true});
            }
        }
    }
    if(isPlainObj(cancelButton) && !React.isValidElement(cancelButton)){
        let {label,perm,text,...action} = cancelButton;
        let canAddCancelBtn = typeof perm =='function' ? perm(args)  : true;
        if(canAddCancelBtn && (text||label)){
            action = {...defaultObj(action)};
            action.label = defaultVal(label,text)
            action.key = defaultStr(action.key,'cancel-btn-action');
            action.isAction = false;
            action.isAlert = isAlert;
            action = actionMutator({action,isAlert,isCancelButton:true,key:action.key});
            if(isObj(action)){
                const {onPress} = action;
                action.onPress = (args)=>{
                    args = {...opts,...React.getOnPressArgs(args),isAlert};
                    if(isAlert){
                        args.closeAlert = args.closeDialog = onAlertRequestClose;
                    }
                    if(onPress){
                        return onPress(args);
                    }
                    return false;
                }
                if(menus.length && countActions > 1){
                    menus.push({...action,isMenuItem:true});
                } else {
                    _actions.push(<Button testID={'RN_AppBarCancelButton'} {...action} key={action.key}/>)
                }
            }
        }
    }
    alwaysSplitOnMobile = isMobileMedia()? alwaysSplitOnMobile : false;
    if(menus.length === 1 && (alwaysSplitOnMobile !== true)){
        menus[0].isMenuItem = false;
        _actions.push(renderAction({actionProps,isAlert,action:menus[0],isAppBarAction,isAppBarActionStyle,opts,isMobile,itemsLength:1,key:"menu-action-"+menus[0].key,ActionComponent}));
        menus = [];
    }
    
    return {
        actions : _actions,
        menus
    };
}

export const renderSplitedActions = (splitedActions,menuProps)=>{
    menuProps = defaultObj(menuProps);
    const {withBottomSheet,BottomSheetComponent,...rest} = menuProps;
    const MenuComponent = withBottomSheet && React.isComponent(BottomSheetComponent) ? BottomSheetComponent : Menu;
    const rest2 = {},anchorProps = {
        ...defaultObj(menuProps.anchorProps),
        icon : MORE_ICON,
    };
    if(withBottomSheet){
        rest2.anchor = (props)=>{
            return <Icon
                {...anchorProps}
                {...props}
            />
        }
    }
    return isSplitedActions(splitedActions) && (splitedActions.actions.length || splitedActions.menus.length) ? <>
        {splitedActions.actions}
        {splitedActions.menus.length ?
            <MenuComponent
                testID = {"RN_AppBarMenuAnchor"}
                {...defaultObj(rest)}
                {...rest2}
                anchorProps = {anchorProps}
                items = {splitedActions.menus}
            />
        : null}
    </> : null;
}

