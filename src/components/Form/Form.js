import Field from "./Fields/Field";
import React from "$react";
import {classExtends,isFunction,isNonNullString,defaultStr,defaultObj,defaultVal,extendObj} from "$cutils";
import {warning,Forms} from "./utils";
import Action from "./Action";
import { StyleSheet } from "react-native";
import APP from "$capp/instance";
import PropTypes from "prop-types";
import View from "$ecomponents/View";

/**** règles d'utilisation : 
    1. les forms doivent toujours avoir un nom : chaine de caractère unique pour l'application et non null
    2. tous les champs (Fields) doivent avoir un name et un formName
    3. le nom de la form est unique pour l'application
    4. Les actions de forms sont les buttons qui lorsqu'ils sont cliqués, envoient les données de la form : ils prennent en 
        paramètre la data, le contenu de la form
    5. Les Fields doivent obligatoirement avoir un unique nom
    7. Idems pour les fields, les actions de la form doivent avoir un formName, pour le nom de la form à qui ils font référence
 */
export default class FormComponent extends React.AppComponent {
    constructor(props) {
        super(props);
        this.isValid = this.isValid.bind(this);
        this.getFields = this.getFields.bind(this);
        this.getField = this.getField.bind(this);
        this.resetFields = this.resetFields.bind(this);
        this.getData = this.getData.bind(this);
        Forms.trigger("mount",props.name,this);
    }
    getErrorText(){
        return defaultStr(this.___errorText);
    }
    getErrorLabel(){
        return defaultStr(this.___errorText);
    }
    /*** vérifie si la form est valide */
    isValid () {
        let fields = this.getFields();
        this.___errorText = "";
        if(isObj(fields)){
            for(var j in fields){
                const f = fields[j];
                if(f && !f.isValid() && f.getErrorText){
                    this.___errorText = f.getErrorText(true);
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    /*** retourne les données du formulaire 
     *  on retourne en plus des données initialement passées en paramètre, la liste des données 
     *  qui ont été modifiées
    */
    getData(options){
        if(isObj(options) && options.handleChange === false){
            return defaultObj(this.props.data);
        }
        const r = Object.assign({},this.props.data);
        let fields = this.getFields();
        if(!isObj(fields)) return r;
        for(var i in fields){
            let field = fields[i];
            if(!isField(field)) continue;
            const fName = field.getName(),fValue = field.isValid() ? field.getValidValue(r) : field.getInvalidValue();
            r[fName] = fValue;
            if(fValue === undefined && field.isHtml()){
                delete r[fName];
            }
        }
        return r;
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        Forms.trigger("unmount",this.props.name);
    }
    componentDidMount(){
        super.componentDidMount();
        Forms.trigger("mount",this.props.name,this,false);
    }
    resetFields(){
        this._fields = {}
    }
    getFields (){
        return this._fields;
    }
    getField (fieldName){
        if(!isNonNullString(fieldName)) return null;
        let fields = defaultObj(this.getFields());
        return fields[fieldName] || null;
    }
    render (){
        if(isNonNullString(this.props.perm) && !Auth.isAllowedFromStr(this.props.perm)){
            return null;
        }
        let {
            onValidate,
            onNoValidate,
            onValidateField,
            onSubmit,
            perm,
            onNoValidateField,
            onKeyEvent,
            keyboardEvents,
            onEnterKeyPress,
            testID,
            ...rest
        } = this.props;
        testID = defaultStr(testID,"RN_FormComponent");
        return <View  {...rest} testID={testID+"_FormKeyboardAvoidingView"} style={[styles.container,rest.style]}>
            {this.props.children}
        </View>
    }
}
const isField  = (Component)=>{
    return classExtends(Component,Field);
}

const isForm  = (Component)=>{
    return classExtends(Component,FormComponent);
}

const getForm = (formName)=>{
    if(!isNonNullString(formName)) return null;
    if(!isObj(Forms) || !isObj(Forms.forms)) return null;
    if(!isForm(Forms.forms[formName])) return null;
    return APP.FormsManager.forms[formName];
}

if(!isFunction(Forms.get)){
    Object.defineProperties(Forms,{
        get : {
            value : getForm,override:false,writable:false
        },
        getForm : {
            value : getForm,override:false,writable:false
        },
        isForm : {
            value : isForm,override:false,writable:false
        }
    });
}

Object.defineProperties(FormComponent,
    {
        Action : {
            value :  Action,
            override : false,
            writable : false,
        },
        isField : {
            value : isField,
            override : false,
            writable : false
        },
        'warning' : {
            value : warning,
            override : false,
            writable : false
        },
        isForm : {
            value : isForm,writable:false,override:false
        },
        getForm : {
            value : getForm,writable:false,override:false
        },
    }
)


FormComponent.propTypes = {
    /*** la permission qu'à l'utilisateur sur le champ
     *  chaine de caractère de la forme : 
     *  resource : action où resource représente la resource en question et action : l'action sur la resource
     */
    perm : PropTypes.string,
    /**** cette fonction est appelée lorsque les données du formulaire sont appelées
     *  elle est appelée à partir du composant Field, lorsque le formulaire est valide et que le bouton Entrée à été cliqué
     *  onSubmit ({data,context,currentField})
     *  la props currentField : représente le champ qui est à l'origine de l'envoie du formulaire
     */
    onSubmit : PropTypes.func,
    Component : PropTypes.any,//le composant react qui est utilisée pour monter la form, par défaut, le Fragment React
    name : PropTypes.string, //le nom de la form
    onValidate : PropTypes.func, //lorsque tous les champs de la form sont validés
    /*** Cette fonction est appelée lorsque au moins un champ de la form n'est pas valide : 
     * elle prend en paramètre : 
     *      -name : le nom du champ,
     *      -value : la valeur qui n'a pas été validée pour le champ,
     *      -msg : Le message d'erreur correspondant
     *      -validRule : La règle de validation,
     *      -validParams : Les paramètres de validation,
     *      -event : L'évènement utilisée qui a déclanché la validation du formulaire
     */
    onNovalidate : PropTypes.func, //lorsque au moins un champ de la form n'est pas validée,
    onValidateField : PropTypes.func,
    /*** objet de la forme : 
     *  {

     *      eventName : handler 
            avec eventName   le nom de l'évènement et hanbler la fonction de rappel à appeler
     *  }
     */
    keyboardEvents : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]),
    onEnterKeyPress : PropTypes.func, ///Lorsque l'on table la touche entrée du clavier
    onKeyEvent : PropTypes.func/*** l'évènement global appelé lorsqu'on clique sur une champ de la form */,
}

const styles = StyleSheet.create({
    container : {
        width : '100%',
        flexDirection : 'row',
        padding : 10,
        flexWrap : 'wrap',
    }
})
