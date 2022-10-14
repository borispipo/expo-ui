import FormData from "./FormData";
import showConfirm from "$ecomponents/Dialog/confirm";
import Dimensions from "$platform/dimensions";
import {defaultStr,isObj,defaultObj,isNonNullString,defaultVal,defaultFunc} from "$utils";
import React from "$react";
import {isWeb} from "$platform";
import PropTypes from "prop-types";


export default class FormDataActionComponent extends FormData {
    isFullScreen(){
        const mainProps = this.getMainProps();
        return typeof mainProps.fullScreen =='boolean'? mainProps.fullScreen : typeof mainProps.fullPage =='boolean'? mainProps.fullPage : mainProps.responsive !== false ? Dimensions.isMobileOrTabletMedia() : false;
    }
    getMainProps (){
        return this.props;
    }
    getConfirmTitle(){
        const {title,subtitle,isEditing} = this.getAppBarProps();
        if(title){
            return subtitle ? (title+(isWeb()?(isEditing || isWeb()?' | ':''):"\n")+subtitle) : title;
        }
        return subtitle;
    }
    close (){}
    getNewElementLabel(){
        return defaultStr(this.getMainProps().newElementLabel,this.props.newElementLabel,'Nouveau');
    }
    getIndexFieldProps(){
        return defaultVal(this.getMainProps().indexField,this.props.indexField);
    }
    getAppBarProps(){
        const mainProps = this.getMainProps();
        const data = this.getDataProp();
        const appBarProps = Object.assign({},mainProps.appBarProps);
        const indexField = this.getIndexFieldProps();
        const isEditing = this.isDocEditing(data);
        let subtitle = (isEditing?'Modifier':this.getNewElementLabel());
        let title = React.getTextContent(defaultVal(appBarProps.title,mainProps.title,this.props.title));
        if(isEditing){
            let _title = "";
            if(isNonNullString(indexField)){
                _title = defaultStr(data[indexField]);
            } else if(isNonNullString(data.code)){
                _title = data.code;
            }
            if(_title){
                subtitle+= " ["+_title+"]"
            }
        } else {
            subtitle = " ["+subtitle+"]";
        }
        if(this.props.title !== false && mainProps.title !== false) {
            appBarProps.title = title;
        }
        appBarProps.isEditing = isEditing;
        if(appBarProps.subtitle !== false && this.props.subtitle !== false && mainProps.subtitle !== false){
            appBarProps.subtitle = subtitle = defaultVal(appBarProps.subtitle,subtitle);
        }
        return appBarProps;
    }
    /*** si l'on doit afficher une boîte de dialogue lorsque l'on veut modifier l'élément en cours de modification */
    showConfirmOnCancel(){
        return this.props.confirmOnCancel !== false;
    }
    onBackActionPress(args,callback){
        args = defaultObj(args);
        const mainProps = this.getMainProps();
        const hasP = mainProps !== this.props;
        const cb = ()=>{
            if(typeof mainProps.onBackActionPress =='function' && mainProps.onBackActionPress(args) === false) return
            else if(hasP && typeof this.props.onBackActionPress =='function' && this.props.onBackActionPress(args) === false) return;
            if(typeof callback =='function'){
              return  callback(args);
            }
            return this.close();
        }
        if(this.showConfirmOnCancel()){
            showConfirm({
                title : defaultStr(this.getConfirmTitle(),'Annuler L\'opération en cours'),
                message : "Voulez vous annuler l'opération en cours?",
                onSuccess :cb
            });
        } else {
            cb();
        }
        return true;
    }
    /*** si l'on autorise la création d'un nouvel élément */
    canCreateNew(){
        return true;
    }
    getAppBarActionsProps(props){
        props = defaultObj(props,this.getMainProps(),this.props);
        let {actions,save2NewAction,save2printAction,save2closeAction,saveAction,newAction} = props;
        const sArg = {context:this};
        save2NewAction = typeof save2NewAction =='function' ? save2NewAction (sArg) : save2NewAction;
        save2closeAction = typeof save2closeAction ==='function'? save2closeAction(sArg) : save2closeAction;
        saveAction = typeof saveAction ==='function'? saveAction(sArg) : saveAction;
        newAction = typeof newAction ==='function'? newAction (sArg) : newAction;
        const context = this;
        const appBarProps = this.getAppBarProps();
        const data = this.getDataProp();
        const isEditing = this.isDocEditing(data);
        let textSave = isEditing ? "Modifier": 'Enregistrer';
        const newElementLabel = defaultStr(props.newElementLabel,this.props.newElementLabel,"Nouvel Element");
        const indexField = this.getIndexFieldProps();
        if(isEditing){
            const t = isNonNullString(indexField) && isNonNullString(data[indexField])? data[indexField] : isNonNullString(data.code)? data.code : undefined;
            if(t){
                textSave+="["+t+"]"
            }
        }
        if(actions == undefined && actions !== false){
            actions = {
                save2new : save2NewAction? {
                    isAction : true,
                    text : textSave+' & '+newElementLabel,
                    icon : 'content-save-edit',
                    onPress : ()=>{
                        context.clickedAction = 'save2new';
                    }
                } : null,
                save2close : save2closeAction? {
                    text : textSave+'+ Fermer',
                    isAction : true,
                    icon : 'content-save-all-outline',
                    onPress : ()=>{
                        context.clickedAction = 'save2close';
                    }
                } : null,
                save : saveAction !== false ? {
                    isAction : true,
                    text : textSave,
                    icon : 'check',
                    title : textSave,
                    onPress : (a)=>{
                        context.clickedAction = 'save';
                    }
                } : null,
                newElt : isEditing && newAction && this.canCreateNew() ? {
                    isAction : false,
                    text : newElementLabel,
                    icon : 'new-box',
                    onPress : ()=>{this.createNew.bind(this)}
                } : null,
            }
        }
        return super.getAppBarActionsProps({actions,...props,fullScreen : this.isFullScreen(),isFormAction:true,appBarProps})
    }
}

FormDataActionComponent.propTypes = {
    ...FormData.propTypes,
}