import FormData from "./FormData";
import {defaultObj,isObj,isNonNullString} from "$utils";
import PropTypes from "prop-types";

export default class FormDataListScreen extends FormData{
    constructor(props){
        super(props);
        Object.defineProperties(this,{
            isAllowed : {
                value : true
            }
        })
    }
    isDocEditing(data){
        if(super.isDocEditing(data)) return true;
        const {indexField,isDocUpdate,isDocEditing} = this.props;
        if(isObj(data) && typeof isDocUpdate !=='function' && typeof isDocEditing !='function'){
            if(isNonNullString(indexField) && data[indexField]) return true;
            if(data.code) return true;
        }
        return false;
    }
    getAppBarActionsProps(props){
        const {save2NewAction,save2closeAction,saveAction} = this.props;
        return super.getAppBarActionsProps({...props
            ,save2NewAction : typeof save2NewAction !=='undefined'? save2NewAction:true
            ,save2closeAction : typeof save2closeAction !=='undefined'? save2closeAction:true
            ,saveAction : typeof saveAction !=='undefined'? saveAction:true,
        });
    }
    createNew (){
        const {show} = this.props;
        if(typeof show =='function'){
            show({...this.props,index:undefined,data:{}});
        }
    }
    doSave(args){

    }
    doSave2New(args){
        if(!this.__canSaveListData) return;
        const {show} = this.props;
        if(typeof show =='function'){
            show({...args,index:undefined,data:{}});
        }
    }
    doSave2Close(args){
        if(!this.__canSaveListData) return;
        return this.close();
    }
    onSave(args){
        let {formDataProps} = this.props;
        this.__canSaveListData = true;
        formDataProps = defaultObj(formDataProps);
        if(typeof formDataProps.onSave =='function' && formDataProps.onSave(args) === false){
            this.__canSaveListData = false;
            return;
        }
    }
    _render(content){
        let {isAllowed} = this.props;
        if(typeof isAllowed ==='function'){
            isAllowed = isAllowed({data:defaultObj(this.props.data,this.props.data),context:this})
        } else isAllowed = true;
        if(isAllowed === false || !this.isAllowed){
            Auth.showError();
            return null;
        }
        return super._render(content);
    }
}

FormDataListScreen.propTypes = {
    ...FormData.propTypes,
    newAction : PropTypes.bool,
    saveAction : PropTypes.bool,
    save2NewAction : PropTypes.bool,
    save2closeAction : PropTypes.bool,
    isAllowed : PropTypes.func, ///la fonction permettant de v??rifier si l'utilsateur a acc??s ?? la modification ou cr??ation de la ressource
    perm : PropTypes.string, //la fonction garantissant l'acc??s ?? la ressource par l'utilisateur
    saveDataMutator : PropTypes.func, //la fonction app??l??e pour effecteur une mutation sur les donn??es qu'on veut enregistrer
}
