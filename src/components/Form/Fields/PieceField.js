import TextField from "./TextField";
import PropTypes from "prop-types";
import { UPPER_CASE } from "$src/lib/validator";
import {isNonNullString,defaultStr} from "$utils";
//mport {isDocUpdate} from "$database/utils";
import React from "$react";
import {copyTextToClipboard} from "$app/clipboard/utils";
import Icon,{COPY_ICON} from "$components/Icon";
import { ActivityIndicator } from "react-native-paper";
import dbUniqid from "$database/plugins/uniqid";

export default class FormPieceField extends TextField {
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
        if(isNonNullString(this.piece) && isNonNullString(this.props.tableName)){  
            this.fetchNewId(false);
        }
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
        let data = defaultObj(this.props.data);
        if(!isNonNullString(this.piece)) return undefined;
        if(isDocUpdate(data) && isNonNullString(data[this.name])){
            this.newFieldPieceId = data[this.name];
            return this.newFieldPieceId;
        }
        setTimeout(()=>{
            let {id,pieceId} = dbUniqid({...this.getUniqidArgs()})
            this.newFieldId = id;
            this.newFieldPieceId = isNonNullString(pieceId)?pieceId:id;
            const value = this.newFieldPieceId;
            this.validate({value}); 
            if(focus) this.focus();
        },0);
    }
    /*** retourne la valeur validée */
    getValidValue(data){
        let validValue = super.getValidValue(data);
        data.piece = this.piece;
        data._id = defaultStr(data._id,validValue,this.newFieldPieceId);
        return validValue;
    }
    setPiece(piece,tableName){
        this.tableName = defaultStr(tableName,this.tableName).toUpperCase();
        this.piece = piece;
        this.fetchNewId();
    }
    getUniqidArgs (){
        return {context:this,table:this.tableName,dbName:this.dbName,piece:this.piece}
    }
    isValidRuleDynamic(){
        return true;
    }
    isTextField(){
        return false;
    }
    componentDidUpdate(){
        if(!isNonNullString(this.newFieldPieceId) && this.piece){
            this.fetchNewId();
        }
    }
    _render(props,setRef){
        let {check,checkFields,dbName,tableName,table,piece,...p}  = (props);
        check = defaultVal(check,checkFields);
        this.check = check;
        this.tableName = defaultStr(tableName,table).toUpperCase();
        this.dbName = defaultVal(dbName,'');
        this.piece = defaultVal(this.piece,piece);
        if(isFunction(piece)){
            this.piece = defaultStr(piece(this.getUniqidArgs()),this.piece);
        }
        p.readOnly = true;
        delete p.validType;
        if(isNonNullString(p.name) && isObj(p.data) && isNonNullString(p.data[p.name])){
            p.disabled = true;         
            p.validType = UPPER_CASE;
            p.defaultValue = p.data[p.name];
        } else {
            p.validType = 'required|'+UPPER_CASE;
        }
        if(typeof p.minLength !=='number'){
            p.minLength = 2;
        }
        p.validRule = p.validType;
        if(p.disabled || p.readOnly || p.editable === false){
            const {right} = p;
            p.contentContainerProps = Object.assign({},p.contentContainerProps)
            p.contentContainerProps.pointerEvents = defaultStr(p.contentContainerProps.pointerEvents,"auto");
            ///p.enableCopy = p.defaultValue || this.newFieldPieceId ? true : false;
            p.right = (props)=>{
                const r = typeof right =='function'? right (props) : React.isValidElement(right)? right : null;
                if(!p.defaultValue){
                    return <>{r}<ActivityIndicator
                        {...props}
                        style = {[props.style,{marginRight:10}]}
                    /></>
                }
                return r;
            }
        }   
        this.setValidRule(p.validType);
        return  super._render(p,setRef);
    }
}

/*** le principe est de générer une id et vérifier l'existance deans la bd, jusqu'à retourner un
 *  qui n'existe pas en bd
 */
FormPieceField.propTypes = {
    ...TextField.propTypes,
    tableName : PropTypes.string.isRequired, //le nom de la table dans la bd où dans la liste des tables de pieces : CONSTANTS.PIECES
    //le type de données dont on veut déterminer le numéro de piece doit être obligatoire
    //ce type doit exister dans la table des piece : PIECE[table][type] doit retourner le prochain index
    ///si c'est une fonction elle doit être utilisée pour générer le préfix de la piece
    piece : PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.func.isRequired
    ]), 
    /*** le nom de la table dans laquelle l'idField est enreigistré */
    /*** le nom de la bd où l'id field est enregistré */
    dbName : PropTypes.string,
}

FormPieceField.defaultProps = {
    name : '_id'
}
