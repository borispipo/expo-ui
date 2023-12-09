import FormData from "./FormData";
import showConfirm from "$ecomponents/Dialog/confirm";
import Dimensions from "$cplatform/dimensions";
import {defaultStr,isObj,defaultObj,isNonNullString,defaultVal,defaultFunc} from "$cutils";
import React from "$react";
import {isWeb} from "$cplatform";
import PropTypes from "prop-types";

export default class FormDataActionComponent extends FormData {
    isFullScreen(){
        const mainProps = this.props;
        return typeof mainProps.fullScreen =='boolean'? mainProps.fullScreen : typeof mainProps.fullPage =='boolean'? mainProps.fullPage : mainProps.responsive !== false ? Dimensions.isMobileOrTabletMedia() : false;
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
        return defaultStr(this.props.newElementLabel,this.props.newElementLabel,'Nouveau');
    }
    getIndexFieldProps(){
        return defaultVal(this.props.indexField,this.props.indexField);
    }
    getAppBarProps(){
        const mainProps = this.props;
        const data = this.getDataProp();
        const appBarProps = Object.assign({},mainProps.appBarProps);
        const isEditing = this.isDocEditing(data);
        let subtitle = (isEditing?'Modifier':this.getNewElementLabel());
        let title = React.getTextContent(defaultVal(appBarProps.title,mainProps.title,this.props.title));
        const cArgs = {...mainProps,isEditing,isDocUpdate:isEditing,isUpdate:isEditing,data};
        let hasFoundTitle = false,hasFoundSubtitle = false;
        if(typeof this.props.getAppBarTitle =='function'){
            const t = defaultStr(this.props.getAppBarTitle(cArgs))
            hasFoundTitle = isNonNullString(t);
            if(hasFoundTitle){
                title = t;
            }
        }
        if(typeof this.props.getAppBarSubtitle =='function'){
            const st = this.props.getAppBarSubtitle(cArgs);
            hasFoundSubtitle = st === false || isNonNullString(st);
            subtitle = hasFoundSubtitle ? st : subtitle;
        }
        if(isEditing){
            let _title = this.getPrimaryKeysFieldsValueText(data);
            if(!hasFoundSubtitle && isNonNullString(_title)){
                subtitle+= " ["+_title+"]"
            }
        } else if(!hasFoundSubtitle) {
            subtitle = " ["+subtitle+"]";
        }
        if(this.props.title !== false && mainProps.title !== false) {
            appBarProps.title = title;
        }
        appBarProps.isEditing = isEditing;
        if(appBarProps.subtitle !== false && this.props.subtitle !== false && mainProps.subtitle !== false){
            appBarProps.subtitle = subtitle = defaultVal(appBarProps.subtitle,this.props.subtitle,subtitle);
        }
        return appBarProps;
    }
    /*** si l'on doit afficher une boîte de dialogue lorsque l'on veut modifier l'élément en cours de modification */
    showConfirmOnCancel(){
        return this.props.confirmOnCancel !== false;
    }
    onBackActionPress(args,callback){
        args = defaultObj(args);
        const mainProps = this.props;
        const hasP = mainProps !== this.props;
        const cb = ()=>{
            if(typeof mainProps.onBackActionPress =='function' && mainProps.onBackActionPress(args) === false) return
            else if(hasP && typeof this.props.onBackActionPress =='function' && this.props.onBackActionPress(args) === false) return;
            else if(typeof this.props.onCancel =='function' && this.props.onCancel(args) === false) return;
            if(typeof callback =='function'){
              return  callback(args);
            }
            return this.close();
        }
        if(this.showConfirmOnCancel() && (args.isProvider!==true && !args.isFullScreen)){
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
    /*** permet de récupérer le contenu textuel associé à la données en cours de modification, pour les clés primaires */
    getPrimaryKeysFieldsValueText(data){
        data = defaultObj(data);
        const indexField = this.getIndexFieldProps();
        return isNonNullString(indexField) && isNonNullString(data[indexField])? data[indexField] : isNonNullString(data.code)? data.code : undefined; 
    }
    getAppBarActionsProps(props){
        props = defaultObj(props,this.props);
        let {actions,save2NewAction,save2printAction,isPrintingForm,save2closeAction,saveAction,newAction} = props;
        const sArg = {context:this};
        save2NewAction = typeof save2NewAction =='function' ? save2NewAction (sArg) : save2NewAction;
        save2closeAction = typeof save2closeAction ==='function'? save2closeAction(sArg) : save2closeAction;
        saveAction = typeof saveAction ==='function'? saveAction(sArg) : saveAction;
        newAction = typeof newAction ==='function'? newAction (sArg) : newAction;
        const context = this;
        const appBarProps = this.getAppBarProps();
        const data = this.getDataProp();
        const isEditing = this.isDocEditing(data);
        let textSave = isPrintingForm ? "Imprimer" : isEditing ? "Modifier": 'Enregistrer';
        const newElementLabel = defaultStr(props.newElementLabel,this.props.newElementLabel,"Nouvel Element");
        if(isEditing){
            const t = this.getPrimaryKeysFieldsValueText(data);
            if(isNonNullString(t)){
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
                    icon : isPrintingForm ? 'printer':'check',
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
    getAppBarTitle: PropTypes.func,//la fonction pour récupérer l'appbat title
    getAppBarSubtitle : PropTypes.func, //la fonction pour récupérer le subtitle de l'appBar
}