import TextField from "./TextField";
import PropTypes from "prop-types";
import { UPPER_CASE } from "$clib/validator";
import {isNonNullString,defaultStr,isPromise} from "$cutils";
import React from "$react";
import { ActivityIndicator } from "react-native-paper";

export default class FormIDField extends TextField {
    constructor(props){
        super(props)
        this.autobind();
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.newFieldIdValue = undefined;
        return super.UNSAFE_componentWillReceiveProps(nextProps);
    }
    /***
        détermnine si la valeur est valide
    */
    isValidIdValue(value){
        return isNonNullString(value) || typeof value =="number";
    }
    componentDidMount(){
        super.componentDidMount();
        this.fetchNewId(false);
    }
    handleCheckIdError(msg,errorCb){
        this.canCheckAgain = false;
        this.hasError = true;
        if(isNonNullString(msg)) this.onNoValidate(msg,undefined,this,null,null);
        if(isFunction(errorCb)){
            errorCb(e);
        }
    }
    
    /****
        récupère la valeur de l'id distante
        @param {function} cb, la fonction de rappel à appeler pour le rendu du résultata
    */
    fetchNewIdRemotely(cb){
        const data = defaultObj(this.props.data);
        const fId = typeof this.props.fetchNewId =='function'? this.props.fetchNewId({...this.props,data,columnField:this.name}) : null;
        if(isPromise(fId)){
            return fId.then(cb).catch(e=>{
                console.log(e," fetching new piece id ",this.name);
            });
        }
        return cb(fId);
    }
    
 
    /*** met à jour la données du numéro de piece */
    fetchNewId(focus){
        if(this.isFilter()){
            return Promise.resolve("");
        }
        const data = defaultObj(this.props.data);
        const name = defaultStr(this.name, this.props.name);
        if(!name) return Promise.resolve("");
        const cb = (value)=>{
            if(this.isValidIdValue(value)){
                this.newFieldIdValue = value;
                this.validate({value}); 
                if(focus) this.focus();
            }
        }
        if(this.isValidIdValue(data[name])){
            cb(data[name]);
            return data[name]
        }
        setTimeout(()=>{
            this.fetchNewIdRemotely(cb);
        },10);
    }
    /*** retourne la valeur validée */
    getValidValue(data){
        const validValue = super.getValidValue(data);
        if(!isNonNullString(this.name)) return validValue;
        data[this.name] = this.isValidIdValue(data[this.name])? data[this.name] : this.isValidIdValue(validValue)? validValue : this.newFieldIdValue;
        return validValue;
    }
    isValidRuleDynamic(){
        return true;
    }
    isTextField(){
        return false;
    }
    componentDidUpdate(){
        if(!this.isFilter() && !this.isValidIdValue(this.newFieldIdValue)){
            this.fetchNewId();
        }
    }
    _render(props,setRef){
        delete props.validType;
        const data = defaultObj(props.data);
        const name = defaultStr(this.name, this.props.name);
        const hasV = this.isValidIdValue(data[name]);
        props.upper = typeof props.upper =="boolean"? props.upper : true;
        if(!this.isFilter()){
            const upper = props.upper ? UPPER_CASE : "";
            if(name && hasV){
                props.disabled = true;         
                props.validType = upper;
                props.defaultValue = data[name];
            } else {
                props.validType = 'required|'+upper;
            }
            if(typeof props.minLength !=='number'){
                props.minLength = 2; //la longueur minimale d'un champ de type id est de 2
            }
            const defValue = props.defaultValue = this.isValidIdValue(props.defaultValue)? props.defaultValue : this.isValidIdValue(this.newFieldIdValue)? this.newFieldIdValue : undefined;
            props.validRule = props.validType;
            props.contentContainerProps = Object.assign({},props.contentContainerProps)
            props.contentContainerProps.pointerEvents = defaultStr(props.contentContainerProps.pointerEvents,"auto");
            props.enableCopy = typeof props.enableCopy ==='boolean'? props.enableCopy : (props.defaultValue || this.newFieldIdValue ? true : false);
            props.readOnly = typeof props.readOnly =="boolean"? props.readOnly : typeof props.disabled ==='boolean' ? props.disabled : false;
            
            const {right} = props;
            props.right = (props)=>{
                const r = typeof right =='function'? right (props) : React.isValidElement(right)? right : null;
                if(!defValue){
                    return <>{r}<ActivityIndicator
                        {...props}
                        style = {[props.style,{marginRight:10}]}
                    /></>
                }
                return r;
            }
            this.setValidRule(props.validType);
        } else {
            props.enableCopy = false;
            props.disabled = props.readOnly = false;
        }
        return  super._render(props,setRef);
    }
}

/*** le principe est de générer une id et vérifier l'existance deans la bd, jusqu'à retourner un
 *  qui n'existe pas en bd
 */
FormIDField.propTypes = {
    ...TextField.propTypes,
    fetchNewId : PropTypes.func, ///({data,...props}), la fonction permettant de fetch un newId pour la données
}
FormIDField.filter = false;//disabled on filter component