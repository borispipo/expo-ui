import Field from "./Field";
import Image from "$components/Image";
import PropTypes from "prop-types";
import {defaultVal} from "$utils";
export default class FormFieldImage extends Field {
    constructor(props){
        super(props)
        this.autobind();
    }
    canHandleWidthOrHeightProps(){
        return true;
    }
    canFocus(){
        return false;
    }
    isValid(){
        return true;
    }
    onChange(args){
        let {dataUrl}= args;
        const previousValue = this.getPreviousValue();
        if(previousValue === dataUrl && previousValue){
            return ;
        }
        this.validate({...args,value:dataUrl,context:this});
        /*if(isFunction(this.props.onChange)){
            this.props.onChange({dataUrl,src:dataUrl,dataURL:dataUrl,previousSrc:previousValue});
        }*/
    }
    getComponent(){
        return Image;
    }
    _render(props){
        let {dbName,onChange,...p}  = props;
        p.onChange = this.onChange.bind(this);
        return <Image
           {...p}
           src={defaultVal(p.src,p.defaultValue)}
        />
    }
    isTextField(){
        return false;
    }
}

FormFieldImage.propTypes = {
    width : PropTypes.number,
    height : PropTypes.number,
    /*** le nom du champ qu'on valide 
     *  si fieldName est définie, alors, il est utilisé pour la validation du champ.
     *  lorsque la valeur est mise à jour, on recherche en base toutes les objets ayant pour valeur ladite valeur
     *  Si est trouvé, alors une erreur est retournée.
     *  Dans le cas où fieldName est définie, alors, l'id n'est pas utilisé pour la validation
     * 
    */
    fieldName : PropTypes.string,
    ...Field.propTypes,
    /*** le nom de la table dans laquelle l'idField est enreigistré */
    table : PropTypes.string,
    tableName : PropTypes.string, //idem à table
    /*** le nom de la bd où l'id field est enregistré */
    dbName : PropTypes.string,
    //la longueur maximale du champ
    maxLength:PropTypes.number
}
