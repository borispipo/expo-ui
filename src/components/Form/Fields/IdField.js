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
        this.newFieldPieceId = undefined;
        return super.UNSAFE_componentWillReceiveProps(nextProps);
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

    /*** met à jour la données du numéro de piece */
    fetchNewId(focus){
        const data = defaultObj(this.props.data);
        if(!isNonNullString(this.name)) return undefined;
        const cb = (value)=>{
            if(isNonNullString(value)){
                this.newFieldPieceId = value;
                this.validate({value}); 
                if(focus) this.focus();
            }
        }
        if(isNonNullString(data[this.name])){
            cb(data[this.name]);
            return data[this.name]
        }
        setTimeout(()=>{
            const fId = typeof this.props.fetchNewId =='function'? this.props.fetchNewId({...this.props,data,columnField:this.name}) : null;
            if(isPromise(fId)){
                return fId.then(cb).catch(e=>{
                    console.log(e," fetching new piece id ",this.name);
                });
            }
            return cb(fId);
        },10);
    }
    /*** retourne la valeur validée */
    getValidValue(data){
        const validValue = super.getValidValue(data);
        if(!isNonNullString(this.name)) return validValue;
        data[this.name] = defaultStr(data[this.name],validValue,this.newFieldPieceId);
        return validValue;
    }
    isValidRuleDynamic(){
        return true;
    }
    isTextField(){
        return false;
    }
    componentDidUpdate(){
        if(!isNonNullString(this.newFieldPieceId)){
            this.fetchNewId();
        }
    }
    _render(props,setRef){
        props.readOnly = true;
        delete props.validType;
        if(isNonNullString(this.name) && isObj(props.data) && isNonNullString(props.data[this.name])){
            props.disabled = true;         
            props.validType = UPPER_CASE;
            props.defaultValue = props.data[this.name];
        } else {
            props.validType = 'required|'+UPPER_CASE;
        }
        if(typeof props.minLength !=='number'){
            props.minLength = 2;
        }
        props.validRule = props.validType;
        if(props.disabled || props.readOnly || props.editable === false){
            const {right} = props;
            props.contentContainerProps = Object.assign({},props.contentContainerProps)
            props.contentContainerProps.pointerEvents = defaultStr(props.contentContainerProps.pointerEvents,"auto");
            ///props.enableCopy = props.defaultValue || this.newFieldPieceId ? true : false;
            props.right = (props)=>{
                const r = typeof right =='function'? right (props) : React.isValidElement(right)? right : null;
                if(!props.defaultValue){
                    return <>{r}<ActivityIndicator
                        {...props}
                        style = {[props.style,{marginRight:10}]}
                    /></>
                }
                return r;
            }
        }   
        this.setValidRule(props.validType);
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