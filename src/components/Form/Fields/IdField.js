import TextField from "./TextField";
import PropTypes from "prop-types";
import {isNonNullString,defaultStr} from "$utils";
import { UPPER_CASE } from "$src/lib/validator";
//import {isDocUpdate} from "$database/utils";

/*** le composant IdField reprend exactement les même propriétés 
 *  que le composant textField, elle doit cependant avoir obligatoirement un champ 
 *  name, un champ dbName, le nom de la bd ou vérifier l'unicité du champ 
 */
export default class IdField extends TextField {
    constructor(props){
        super(props)
        this.isDocUpdate = false;
    }
    getValidValue(data){
        let _id = super.getValidValue(data);
		if(this.props._id === false){
			return defaultStr(_id);
		}
        let prefix = defaultStr(this.props.table,this.props.tableName).toUpperCase().trim();
        if(this.props.prefix_on_id == false){
            prefix = "";
        } else  ///les id des champs uniques sont définis de la forme : tableName/code 
        if(isNonNullString(prefix)){
            prefix =prefix.rtrim("/")+"/";
            _id = defaultStr(_id).ltrim("/");
        }
        if(!isDocUpdate(data)){
            data._id = (prefix+_id).trim();
        }
        return defaultStr(_id).trim();
    }
    isValidRuleDynamic(){
        return true;
    }
    _render(props,setRef){
        let {dbName,_id,tableName,table,validType,validRule,fieldName,...p}  = props;
        fieldName = defaultStr(fieldName,this.name,p.name);
        this.fieldName = fieldName;
        if(isNonNullString(fieldName) && isObj(props.data)){    
            this.isDocUpdate = isDocUpdate(p.data) && isNonNullString(props.data[fieldName]);
        }
        tableName = defaultStr(tableName,table).toUpperCase();
        this.maxLength = undefined;
        validType = defaultStr(validType,validRule);
        if(this.isDocUpdate){
            p.disabled = true;         
            p.validType = validType = UPPER_CASE;
        } else {
            //p.disabled = false;
            let maxLength = 15;
            if(isNumber(p.maxLength) && maxLength > 0){
                maxLength = p.maxLength;
            } 
            if(!isNonNullString(dbName)) dbName = '';
            let prefix = tableName;
            if(this.props.prefix_on_id == false){
                prefix = "";
            } 
            if(isNonNullString(prefix)){
                prefix = prefix.toUpperCase().trim()+"/";
                //les champs d'id unique pour la table sont définis de la forme : tableName/id
                //tableName = '';
            }
            if(isNonNullString(fieldName)){
                prefix = "";
            } else fieldName = "";
            let uniqV = 'uniqueid['+dbName+','+tableName+','+(p.label||p.text)+','+fieldName+','+prefix+']';
            let validType1 = 'maxLength['+maxLength+']';                     
            
            if(!validType.contains("maxLength")){
                validType = validType1.rtrim("|")+"|"+validType.trim().ltrim('|');
            }  
            if(!validType.contains("required")){
                validType = "required|"+validType.ltrim("|");
            }
            if(!validType.contains(uniqV)){
                validType = validType.trim().rtrim('|')+"|"+uniqV;
            } 
            if(!validType.contains(UPPER_CASE)){
                validType += "|"+UPPER_CASE
            }
            p.validType = validType;
            this.INITIAL_STATE.validRule = this.INITIAL_STATE.validType = validType;
            p.maxLength = maxLength;
            if(typeof p.minLength !=='number'){
                p.minLength = 2;
            }
            this.maxLength = maxLength;
        }
        if(p.disabled || p.readOnly || p.editable === false){
            p.contentContainerProps = Object.assign({},p.contentContainerProps)
            p.contentContainerProps.pointerEvents = defaultStr(p.contentContainerProps.pointerEvents,"auto");
            p.enableCopy = p.defaultValue ? true : false;
        }
        this.setValidRule(validType);
        p.upper = true;
        return super._render(p,setRef);
    }
    isTextField(){
        return false;
    }
}

IdField.propTypes = {
    /**** si le champ sera habileté de définir la valeur de l'id
     *  Au fait lorsque dans une même table, il existe au moins deux champ de type pieceId, il est possible que le champ sélectionné pour générer
     *  la valeur de l'id de la table ne soit pas le bon. pour éviter celà, il suffit de passer la props
     *  _id à la valeur false dans tous les champs qui seront ignorés pour le calcul de l'id; ainsi, en cas de validation du champ, la valeur de l'_id de la table ne sera pas calculée
     */
    _id : PropTypes.bool,
    /*** le nom du champ qu'on valide 
     *  si fieldName est définie, alors, il est utilisé pour la validation du champ.
     *  lorsque la valeur est mise à jour, on recherche en base toutes les objets ayant pour valeur ladite valeur
     *  Si est trouvé, alors une erreur est retournée.
     *  Dans le cas où fieldName est définie, alors, l'id n'est pas utilisé pour la validation
     * 
    */
    fieldName : PropTypes.string,
    ///si les id de la table seront préfixés
    prefix_on_id : PropTypes.bool,
    ...TextField.propTypes,
    /*** le nom de la table dans laquelle l'idField est enreigistré */
    table : PropTypes.string,
    tableName : PropTypes.string, //idem à table
    /*** le nom de la bd où l'id field est enregistré */
    dbName : PropTypes.string,
    //la longueur maximale du champ
    maxLength:PropTypes.number
}