import PropTypes from "prop-types";
import KeyboardEventHandler from "../KeyboardEventHandler";
const {getActions,getFormFields,Forms} = require("../utils")
import TextField,{parseDecimal} from "$ecomponents/TextField";
import Icon from "$ecomponents/Icon";
import {extendObj,isBool,isUndefined,uniqid,defaultObj,isObj,defaultFunc,isFunction,isNumber,arrayValueExists,defaultVal,defaultStr,isNonNullString,defaultBool,defaultDecimal} from "$utils";
import {Component as AppComponent} from "$react";
import {observable,addObserver} from "$observable";
import {Validator} from "$validator";
import theme,{grid} from "$theme";
import React from "$react";
import {StyleSheet} from "react-native";
import {isDevEnv} from "$cplatform";
import {isMobileMedia} from "$cplatform/dimensions";
import APP from "$capp/instance";
///la combinaison à appliquer pour modifier le contenu textuel de la valeur
let sanitizeKeyEvent = 'ctrl+m' //le type hashtag
import defaultKeyboardEvents from "../utils/keyboardEvents";
import sprintf from "./sprintf";
import ErrorMessage from "$ecomponents/ErrorBoundary/ErrorMessage";
import { UPPER_CASE, LOWER_CASE} from "$common/lib/validator";


export default class Field extends AppComponent {
    constructor(props) {
        super(props);
        observable(this);
        addObserver(this);
        extendObj(this._events,{
            validatorBeforeValidate : this.validatorBeforeValidate.bind(this),
            validatorValid : this.onValidate.bind(this),
            validatorNoValid : this.onNoValidate.bind(this)
        })
        let {
            name,
            field,
            formName,
            beforeValidate,
            onValidate,
            onNoValidate,
            validType,
            validRule,
            length,
            minLength,
            required,
            renderfilter,
            render_filter,
            maxLength,
            validParams,
        } = props;
        Object.defineProperties(this,{
            __disabledSymbol : {value : Symbol('_disabled'),override:false,writable:false},
            __isDisabledSymbol : { value : Symbol('_isDisabled'),override:false,writable:false},
            __isReadOnlySymbol : { value : Symbol('_isReadOnly'),override:false,writable:false},
            isEnabled : {
                value : ()=>{
                    return !this.isDisabled();
                },override : false, writable : false
            },
            isFilter : {
                value : ()=>defaultVal(renderfilter,render_filter) ? true : false,override : false,writable : false,
            },
            isReadOnly : {
                value : ()=>{
                    return this[this.__isReadOnlySymbol] == true;
                },override : false, writable : false
            },
            isEditable : {
                value : x=> this.isReadOnly(), override : false, writable : false,
            },
            isDisabled : {
                value : ()=>{
                    return this[this.__isDisabledSymbol] === true;
                }, override : false,writable : false
            }
            /*** désactive le champ */
            ,disable : {
                value : ()=>{
                    this[this.__disabledSymbol] = true;
                    this.setState({_sKey:!this.state._sKey})
                }, override : false, writable : false 
            }
            /**** active le champ */
            ,enable : {
                value : () => {
                    this[this.__disabledSymbol] = false;
                    this.setState({_sKey:!this.state._sKey});
                }, override : false, writable : false
            },
            /** si la valeur valide à retourner par le field est de type decimal */
            canValueBeDecimal : {
                value : this.isTextField() && arrayValueExists(['number','decimal'],this.props.type)
                ,override : false, writable : false
            },
            wrapperRef : {
                value : React.createRef(null),
            },
        })
        
        name = defaultStr(name,field,uniqid("form-data-field-name"));
        Object.defineProperties(this,{
            INITIAL_STATE : {
                value :  {formName},
                override : false,
                writable : false
            }
        })
        validType = defaultVal(validType,validRule);
        if(required && (isNonNullString(validType) || validType == null || validType ==undefined || validType === "")){
            validType = isNonNullString(validType)?validType : '';
            validType = validType.contains("required")? validType : ('required|'+validType)
        }
        
        if(isNonNullString(validType) || validType == "" || validType == null || validType ==undefined){
            if(!isNonNullString(validType)) validType = "";
            if(isNumber(length) && length>0){
                if(validType.indexOf('length') === -1){
                    validType="length["+length+"]"+"|"+validType.trim().ltrim("|");
                }
                maxLength = length;
            }
            if(isNumber(minLength) && minLength > 0){
                if(validType.indexOf('minLength') === -1){
                    validType+="|minLength["+minLength+"]"
                }
            }
            if(isNumber(maxLength) && maxLength>0){
                if(validType.indexOf('maxLength') === -1){
                    validType+="|maxLength["+maxLength+"]"
                }
            }
            if(this.props.upper === true || this.props.upperCase === true){
                validType +="|"+UPPER_CASE;
            } else if(this.props.lower === true || this.props.lowerCase === true){
                validType +="|"+LOWER_CASE;
            }
        }
        this.INITIAL_STATE.validType = this.INITIAL_STATE.validRule = validType;
        this.INITIAL_STATE.validParams = validParams;
        Object.defineProperties(this.INITIAL_STATE,{
            beforeValidate : {
                value : defaultFunc(beforeValidate),override : false,
            },
            onValidate : {
                value : defaultFunc(onValidate),override : false,
            },
            onNoValidate : {
                value : defaultFunc(onNoValidate),override : false,
            },
        })
        if(!this.isValidRuleDynamic()){
            Object.defineProperties(this.INITIAL_STATE,{
                validType : {value:validType,override:false},
                validRule : {value:validType,override:false},
                validParams : {value:validParams,override:false},
            })
        }
        Object.defineProperties(this,{
            name : {value:name,override:false,writable:false},
            formName : {value:formName,override:false,writable : false},
            canValidate : {value : defaultVal(props.validate,true),override:false,writable:false},
        })
        if(this.canValidate !== false){
             Forms.trigger("registerField",name,formName,this);
             this.initObservers();
        }
        this.state.errorText = null;
        this.state.error = false;
        this.autobind();
        this.keybaordEvents = [sanitizeKeyEvent];
        Object.map(this.props.keyboardEvents,(k,i)=>{
            if(!defaultKeyboardEvents[k]){
                this.keybaordEvents.push(k);
            }
        })
        this.state.validatingValue = this.validatingValue = defaultVal(this.props.defaultValue);
        this.keybaordEvents = [...Object.keys(defaultKeyboardEvents),...this.keybaordEvents]
        this.state.isMobile = isMobileMedia();
        this.state.textFieldMode = theme.textFieldMode;
    }
    validatorBeforeValidate({value,validRule,validParams,event,...rest}){
        let _result = undefined;
        this.trigger.call(this,"beforeValidate",{...defaultObj(rest),value,name:this.name,field:this.name,formName:this.formName,context:this,event,validRule,validParams},(result)=>{
            for(var r in result){
                if(result[r] === false) {
                    _result = false;
                    return context;
                }
            }
            this.INITIAL_STATE.beforeValidate.call(this,{...defaultObj(rest),value,name:this.name,field:this.name,formName:this.formName,context:this,event,validRule,validParams});
        });
        return _result;
    }
    /*** si le composant devra prendre en compte les props width et height */
    canHandleWidthOrHeightProps(){
        return false;
    }
    callOnChange(args){
        if(typeof this.props.onChange === "function" && this.hasValueChanged(args.value)){
            this.props.onChange(args);
        }
    }
    onValidate ({value,event,...rest}){
        this.trigger.call(this,"validate",{...defaultObj(rest),value,event},(result)=>{
            for(var j in result){
                if(result[j] === false) return this;
            }
            this.validatingValue = value;
            this.INITIAL_STATE._lastValidatingValue = value;
            this.setState ({validValue:value,validatingValue:value,previousValue:this.state.validValue,errorText:"",error:false},()=>{
                this._previousValue  = this.state.validValue;
                let fields = getFormFields(this.formName);
                let canEnable = true;
                for(var k in fields){
                    if(!fields[k].isValid()){
                        canEnable = false;
                        break;
                    }
                }
                let actions = getActions(this.formName);
                let action = canEnable?"enable":"disable";
                for(var k in actions){
                    actions[k][action]();
                }
                let form = Forms.getForm(this.formName);
                this.INITIAL_STATE.onValidate.call(this,{...defaultObj(rest),props:this.props,formName:this.formName,form,name:this.name,field:this.name,value,event,context:this});
                this.callOnChange({value,event,isValid:true,...rest});

                if(form && form.props){
                    if(canEnable){
                        if(isFunction(form.props.onValidate)){
                            form.props.onValidate.call(form,{...defaultObj(rest),formName:this.formName,data:form.getData(),context:form,fieldInstance:this,field:this.name,name:this.name,value,event,form})
                        }
                    }
                    if(isFunction(form.props.onValidateField)){
                        form.props.onValidateField.call(form,{...defaultObj(rest),formName:this.formName,context:this,form,name:this.name,field:this.name,value,form,event})
                    }
                }
            });
        });
    }
    onValidatorValid(args){
        if(isFunction(this.props.onValidatorValid)){
            return this.props.onValidatorValid(args);
        }
        return true;
    }
    onNoValidate({msg,value,context,validRule,validParams,event,...rest}){
        this.validatingValue = value;
        this.trigger.call(this,"noValidate",{...defaultObj(rest),props:this.props,context:this,msg,value,event,validRule,validParams},(result)=>{
            this.setState({
                errorText : msg,
                invalidValue : value,
                validatingValue : value,
                error : true
            },()=>{
                const actions = getActions(this.formName);
                for(var k in actions){
                    actions[k].disable();
                }
                this.INITIAL_STATE.onNoValidate.call(this,{...defaultObj(rest),props:this.props,msg,value,formName:this.formName,field:this.name,name:this.name,context:this,event,validRule,validType:validRule,validParams,context:this});
                let form = Forms.getForm(this.formName);
                this.callOnChange({value,validRule,validParams,event,isValid:false,...rest});
                if(form){
                    if(form.props && isFunction(form.props.onNoValidate)){
                        form.props.onNoValidate.call(form,{...defaultObj(rest),formName:this.formName,fieldInstance:this,name:this.name,field:this.name,value,msg,validRule,validParams,event,context:form});
                    }
                }
            })
        });
    }
    canRenderInlineIndicator(){
        return true;
    }
    initObservers (){
        for(let i in this._events){
            this.on(i,this._events[i]);
        }
    }
    /*** retourne l'instance de la form */
    getForm(){
        return Forms.getForm(this.formName);
    }
    ///retourne l'instance d'un champ autre que celui actuel
    /// si le fieldName n'est pas définit alors on retourne l'instance du field actuel
    getField (fieldName){
        if(!isNonNullString(fieldName)) return this;
        let form = this.getForm();
        if(form && isFunction(form.getField)){
            return form.getField(fieldName);
        }
        return null;
    }

    setRef (el){
        if(el) this._fieldRef = el;
    }
    isFocused(){
        const field = this.getFieldRef();
        if(isObj(field) && typeof field.isFocused =="function"){
            return field.isFocused();
        }
        return false;
    }
    getFieldRef (){
        return this.___formattedField || this._fieldRef;
    }
    onRegister(field,name){}
    getName (){
        return this.name;
    }
    getFormName(){
        return this.formName;
    }
    getOldValue () {
        return this._previousValue;
    }
    /*** la valeur qui a été validée 
     * @param : l'ensemble des données du formulaire à retourner
     * Ce paramètre est utile pour étendre les données validées du formulaire avec certaines données qui ne 
     * sont pas par défaut définies comme champ de formulaire
    */
    parseDecimal(v){
        return parseDecimal(v,defaultStr(this.props.type,this.type));
    }
    getInvalidValue(){
        return this.state.invalidValue;
    }
    getValidValue (data){
        let v = this.state.validValue;
        if(isFunction(this.props.getValidValue)){
            let v1 = this.props.getValidValue.call(this,{data,context:this,props:this.props});
            if(v1 !== undefined){
                v = v1;
            }
        }
        return this.parseDecimal(v);
    }
    canFocus(){
        return true;
    }
    getComponentProps (props){
        return defaultObj(props,this.props);
    }
    isFocused(){
        let f = this.getFieldRef();
        if(!f) return undefined;
        if(typeof f.isFocused ==='function') return f.isFocused();
        return undefined;
    }
    /*** pour focus le champ 
     *  Ajout de la méthode focus, aux FormField pour focus le champ en cas de changement
     *  @return : vrai si l'élément a été focus et faux au cas contraire
    */
    focus (activate){
        if(this.isDisabled() || this.isReadOnly() || !this.canFocus()){
            return false;
        }
        let f = this.getFieldRef();
        if(f && activate !== false){
            if(typeof f.isFocused ==='function' && f.isFocused()) return true;
            if(typeof f.focus ==='function'){
               try { 
                   f.focus();
                   return true;
               } catch(e){
                   if(isDevEnv() )console.log(e," focusing field ",this.name)
               }
            }   
            return false;
        }
        return false;
    }
    /*** retourne le prochain élement et le suivant au field dans l'ensemble des fields de la form
     *   si la valeur du prochainFormField est égale au précédent
    *    @return ({keys,count:keys.length,fields,first,last,next,previous})
    */
    getPrev2NextFields(){
        let form = this.getForm();
        let next = null,nextIndex=-1,index=-1,previousIndex=-1,first,last = null,previous = null,keys=[],fields={};
        if(form && isFunction(form.getFields) ){
            fields = form.getFields();
            if(isObj(fields)){
                keys = Object.keys(fields);
                first = fields[keys[0]];
                last = fields[keys[keys.length-1]];
                for(let f in fields){
                    index++;
                    if(fields[f] === this){
                        break; 
                    }
                }
                if(index>= 0){
                    previousIndex = index-1
                    nextIndex = index+1;
                    previous = fields[keys[previousIndex]];
                    next = fields[keys[nextIndex]]
                }
            }
        }
        return {index,keys,count:keys.length,fields,nextIndex,previousIndex,first,last,next,previous}
    }
    setValue (val,focus,rest){
        if(isObj(focus)){
            let t = rest;
            rest = focus;
            focus = t;
        }
        if(typeof focus !== 'boolean'){
            focus = false;
        }
        if(val == undefined || val =='undefined'){
            val = '';
        }
        this.validate({...defaultObj(rest),value:val});
        return val;
    }
    getValue (){
        return this.validatingValue;
    }
    getDefaultValue (){
        return defaultVal(this.getComponentProps(this.props).defaultValue,this.props.defaultValue);
    }
    isSelectField(){
        return false;
    }
    getPreviousValue (){
        return this._previousValue;
    }
    hasValueChanged(value){
        return (JSON.stringify(this.state.previousValue) === JSON.stringify(value))? false : true;
    }
    isValidRuleDynamic(){
        return false;
    }
    setValidRule(validRule){
        if(this.isValidRuleDynamic()){
            this.INITIAL_STATE.validRule = this.INITIAL_STATE.validType = validRule;
        }
    }
    getValidRule(){
        return this.INITIAL_STATE.validRule;
    }
    validate ({value,event,...rest}){
        value = this.parseDecimal(value);
        this.validatingValue = value;
        if((!this.canValidate) && !this.isSelectField()){
            if(this._isInitialized && !this.hasValueChanged(value)) {
                return;
            }
            this._isInitialized = true;
            this._previousValue = this.state.validValue;
            this.trigger("validate",{...defaultObj(rest),context:this,value,event,oldValue:this.INITIAL_STATE._lastValidatingValue},(results)=>{
                this.setState({validValue:value,validatingValue:value,sk:!this.state.sk,previousValue:this.state.validValue},()=>{
                    if(isFunction(this.props.onValidate)){
                        this.props.onValidate({...defaultObj(rest),props:this.props,name:this.name,field:this.name,value,event,context:this,oldValue:this.INITIAL_STATE._lastValidatingValue});
                    }
                    if(isFunction(this.props.onChange)){
                        this.props.onChange({value,previousValue:this.INITIAL_STATE._lastValidatingValue,event});
                    }
                    this.INITIAL_STATE._lastValidatingValue = value;
                })
            });
            return;
        }
        const validRule = this.getValidRule();
        if(this.isValidRuleDynamic()){
            this.INITIAL_STATE.validRule = this.INITIAL_STATE.validType = validRule;
        }
        Validator.validate({...defaultObj(rest),onValidatorValid:this.onValidatorValid.bind(this),context:this,value,validRule,validType:validRule,validParams:this.INITIAL_STATE.validParams,event})
    }

    /**** met le focus sur l'élément précédent */
    focusPrevField (){
        return;
        let ob = this.getPrev2NextFields();
        let {previous} = ob;
        let focus = false;
        let canGoToNext = true;
        while(canGoToNext && previous){
            focus = previous.focus();
            canGoToNext = previous && !focus;
            if(canGoToNext){
                ob  = previous.getPrev2NextFields();
                previous = ob.previous;
            }
            if(focus){
                this.trigger("blur");
            }
        }
        return ob;
    }
    sprintf(){
        if(this.isDisabled() || this.isReadOnly()) return this;
        sprintf({value:this.getValue(),cb:(val)=>{
            this.setValue(APP.sprintf(val),true);
        }});
    }
    /**** met le focus sur le prochain cham */
    focusNextField (){
        return;
        let ob = this.getPrev2NextFields();
        let {next} = ob;
        let focus = false;
        let canGoToNext = true;
        while(canGoToNext && next){
            focus = next.focus();
            canGoToNext = next && !focus;
            if(canGoToNext){
                ob  = next.getPrev2NextFields();
                next = ob.next;
            }
            if(focus){
                this.trigger("blur");
            }
        }
        return ob;
    }
    componentDidUpdate(){
        super.componentDidUpdate();
        if(typeof this.props.updateNativePropsOnUpdate ==='function'){
            this.props.updateNativePropsOnUpdate({
                target : this.wrapperRef,
                props : this.props,
            });
        }
    }
    componentDidMount (validate){
        super.componentDidMount();
        this.mediaQueryPropsSubscription = React.getMediaQueryPropsSubscription(this.mediaQueryUpdateNativeProps.bind(this),this.wrapperRef);
        if(this.canValidate !== false){
            Forms.trigger("registerField",this.getName(),this.getFormName(),this);
        }
        if(defaultVal(validate,true) && !this.isFilter()) this.validate({context:this,value:defaultVal(this.props.defaultValue)});
    } 
    componentWillUnmount() {
        super.componentWillUnmount();
        this._fieldRef = undefined;
        this.offAll();
        this.clearEvents();
        if(this.mediaQueryPropsSubscription){
            this.mediaQueryPropsSubscription.remove();
        }
        if(this.canValidate !== false){
            Forms.trigger("unregisterField",this.getName(),this.getFormName());
        }
    }
    isHtml(){
        return false;
    }
    mediaQueryUpdateNativeProps(args){
        const {isMobile} = args;
        if(typeof this.props.mediaQueryUpdateNativeProps =='function'){
            args.props = this.props;
            args.context = this;
            return this.props.mediaQueryUpdateNativeProps(args);
        }
        const hasTextFieldModeChanged = true;// = this.state.textFieldMode !== theme.textFieldMode && this.state.isMobile !== isMobile;
        if(this.props.responsive === false && !hasTextFieldModeChanged) return;
        if((hasTextFieldModeChanged)){
            this.setState({isMobile,textFieldMode:theme.textFieldMode});
            return null;
        }
        return {style:grid.col(this.props.windowWidth)};
    }
    onKeyEvent(key,event){
        let form = this.getForm();
        if(!this.canValidate) return; 
        let {keyboardEvents,onKeyEvent} = this.props;
        let formInstance = this.getForm();
        let arg = {key,event,context:this,isFormField:true,formInstance};
        let handler = undefined;
        if(isObj(keyboardEvents)){
            handler = keyboardEvents[key];
            if(isFunction(handler) && handler.call(this,arg) === false) return;
        }
        if(!isFunction(handler)){
            if(isFunction(keyboardEvents)){
                handler = keyboardEvents;
            } else if(isFunction(onKeyEvent)){
                handler = onKeyEvent;
            }
            if(isFunction(handler) && handler.call(this,arg) === false) return;
        }
        handler = undefined;
        if(formInstance && isObj(formInstance.props)){
            let pIP = formInstance.props;
            if(isObj(pIP.keyboardEvents)){
                handler = pIP.keyboardEvents[key];
                if(isFunction(handler)) handler.call(this,arg);
            }
            if(!isFunction(handler)){    
                if(isFunction(pIP.keyboardEvents)){
                    handler = pIP.keyboardEvents;
                } if(isFunction(pIP.onKeyEvent)){
                    handler = pIP.onKeyEvent;
                }
                if(isFunction(handler)) handler.call(this,arg);
            }
        }
        switch(key){
            case 'down':
                this.focusNextField();
                break;
            case 'left':
                this.focusPrevField();
                break;
            case 'right':
                this.focusNextField();
                break;
            case 'up':
                this.focusPrevField();
                break;
            case 'enter' :       
                 if(!form) return this;       
                 break; 
                 let {next,nextIndex,count} = this.focusNextField();
                 if(!next){
                    /**** on a atteind le dernier elément, l'on doit demander à l'enregistrement du formulaire */
                    if(nextIndex >= count){
                        let fields = form.getFields();
                        let canSubmit = true;
                        if(isObj(fields)){
                            for(var j in fields){
                                let field = fields[j];
                                if(field && !field.isValid()){
                                    canSubmit = false;
                                    ///on met le focus sur le prochain élément non valide
                                    if(field.focus()){
                                        break;
                                    }
                                }
                            }
                        }
                        if(canSubmit && form.props && form.props.onSubmit) {
                            //le formulaire peut être envoyé maintenant
                            form.props.onSubmit.call(form,{data:form.getData(),context:form,currentField:this})
                        }
                 }
            }
            break;
            default : 
                if(key === sanitizeKeyEvent){
                    this.sprintf();
                    return false;
                }
                break;
        }
    }
   
    canBindResizeEvent(){
        return true;
    }
    /*** appelée pour la mise à jour du layout state */
    getLayoutState(){}
    updateLayout(event){
        if(!this.canBindResizeEvent()) return;
        
    }

    isValid (){
        return !this.state.error ? true : false;
    }
    /*** cette méthode a été ajouté pour qu'à partir de certains composant Field, l'on puisse apporter des modification 
     *  aux props immédiatement avant qu'elles soient passé au composant requis
     */
    removeNotAllowedProps(props){
        return props;
    }
    isTextField(){
        return true;
    }
    onBlurField(event){
        if(isFunction(this.props.onBlur)){
            this.props.onBlur({event,context:this})
        }
    }
    onFocusField(event){
        if(isFunction(this.props.onFocus)){
            this.props.onFocus({event,context:this})
        }
    }
    _render (props){
        const {defaultValue} = props;
        return <TextField
            {...props}
            value = {defaultValue}
        />
    }
   
    getCallFuncArgs(){
        let data = defaultObj(this.props.data);
        return {
            context:this,
            windowResized:APP.windowHasResized,
            field:this.name,
            name:this.name,
            ...this.props,
            data,
            props:this.props
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps,b,c){
        if(super.UNSAFE_componentWillReceiveProps && super.UNSAFE_componentWillReceiveProps(nextProps,b,c) === false) return;
        if("defaultValue" in nextProps){
            const value = this.parseDecimal(nextProps.defaultValue);
            if(this.isValidRuleDynamic()){
                this.setState({sk:!this.state.sk},()=>{
                    this.validate({value})    
                })
            } else {
                this.validate({value});
            }
        }
    }
    ///si la props right peut être une fonction
    canRightPropsBeFunction(){
        //typeof customRight =='function' || _type =='date' || _type =='time' || _type =='text' || _type=='number' || _type =='decimal' || _type.contains('select')
        return true;
    }
    getErrorText(includeLabel){
        const label = defaultStr(this.label,this.name);
        if(!isNonNullString(this.state.errorText)) return "";
        if(label){
            return this.state.errorText+(includeLabel !== false?(" ["+label+"]"):"");
        } else {
            return this.state.errorText;
        }
    }
    
    render (){
        let {
            data,onKeyEvent,
            keyboardEvents,
            required,
            validRule,
            validType,value,selected,label,text,
            getProps,
            formName,
            datagrid,
            form,
            format,
            validParams,
            //renderfilter, //pour spécifier que c'est un rendu de type filtre
            getValidValue,
            validate,
            onValidate,
            onValidatorValid,///il s'agit de la fonction de rappel appelée immédiatement après que le validateur ait réuissie la validation
            onValidateField,
            onNoValidate,
            disabled,
            visible,
            readOnly,
            editable,
            beforeValidate,
            footer,
            archived,
            windowWidth,
            dataFilesInterest,
            title,
            tooltip,
            right : customRight,
            responsive,
            responsiveProps,
            usePlaceholderWhenEmpty,
            width,
            height,
            ...rest
        } = this.props;
        if(this.state.caughtAnError){
            return <ErrorMessage
                error={this.state.caughtError}
                info={this.state.caughtInfo}
                resetError={this.resetCatchedError.bind(this)}
            />
        }
        const isFilter = this.isFilter();
        rest = defaultObj(rest);
        data = defaultObj(data);
        this.label = label = defaultVal(label,text);
        rest.name = this.name;
        rest.label = label;
        rest.data = data;
        
        
        rest.validRule = rest.validType = this.INITIAL_STATE.validType;
        rest.validParams = this.INITIAL_STATE.validParams;
        
        if(!isUndefined(this.___visible)){
            visible = this.___visible;
        }
        this.___visible = undefined;
        if(!isUndefined(this[this.__disabledSymbol])){
            disabled = this[this.__disabledSymbol];
        }
        
        let callArgs = {context:this,field:this.name,name:this.name,
            value:this.validatingValue,//rest.defaultValue,
            validValue:this.state.validValue,...rest,data,props:this.props};
        readOnly = defaultVal(readOnly);
        if(isFunction(readOnly)){
            //windowResized spécifie tout simplement que le composant est rendu après rédimensionnemnet de la page
            readOnly = readOnly.call(this,callArgs);
        } 
        if(!isUndefined(readOnly)) rest.readOnly = readOnly?true:false;

        if(isFunction(editable)){
            editable = editable.call(this,callArgs);
        } 
        if(isBool(editable)) rest.editable = editable;
        else rest.editable = rest.readOnly ? false : true;
        if(isFunction(disabled)){
            disabled = disabled.call(this,callArgs);
        } 
        if(!isBool(disabled)) rest.disabled = disabled;
        else rest.disabled = disabled ? true : false;

        if(isFunction(archived)){
            archived = archived.call(this,callArgs);
        }
        if(archived === true){
            editable = false;
            disabled = true;
        }
        
        if(rest.readOnly || rest.disabled){
            rest.editable = false;
        }
        if(!disabled){
            disabled = defaultBool(this.props.disabled,false);
        }
        rest.disabled = disabled;

        this[this.__isDisabledSymbol] = rest.disabled;
        this[this.__isReadOnlySymbol] = rest.readOnly || rest.editable === false ? true : false;
        
        if(isFunction(visible)){
            visible = visible({field:this.name,name:this.name,...rest,value:this.validatingValue,data});
        }
        visible = defaultVal(visible,true); 
        rest.defaultValue = this.validatingValue;
        rest.style = [{backgroundColor:'transparent'},rest.style,!visible?{display:'none'}:undefined];
       
        /**** si ce n'est pas un composant de type dropdown*/
        if(!isFunction(rest.filter)){
            delete rest.filter;
        }

        delete rest.export;
        delete rest.colIndex;
        delete rest.accordion;
        delete rest._id;
        delete rest.import;
        delete rest.dataFilesInterest;
        
        delete rest.archivable;
        delete rest.archivable;

        this.___formattedField = undefined;
        let _type = this.type = defaultStr(this.props.type,this.type,"text").trim().toLowerCase();
        format = defaultStr(format).toLowerCase().trim();
        tooltip = defaultVal(tooltip,title);

        const isEditable = rest.disabled !== true && rest.readOnly !== true && rest.editable !== false ? true : false;
        const hasDefaultValue = isNonNullString(rest.defaultValue) || typeof rest.defaultValue =='number'? true : false;
        const canChangeRight = this.isTextField() && !isEditable && hasDefaultValue;
        if(canChangeRight){
            rest.contentContainerProps = Object.assign({},rest.contentContainerProps);
            rest.contentContainerProps.pointerEvents = defaultStr(rest.contentContainerProps.pointerEvents,"auto");
        }
        if(!isFilter && this.canRenderInlineIndicator()){
            const canRenderHashtag = format === 'hashtag' && (!isNonNullString(_type) || _type ==='text');
            const renderRigth = (props)=>{
                let right = null;
                let cRight = typeof customRight ==='function'? customRight(props) : customRight;
                if(!React.isValidElement(cRight)){
                    cRight = null;
                }
                if(tooltip){
                    right = <Icon color={theme.colors.primary} {...props} tooltip = {tooltip} style={[styles.icon,props.style]} icon="information"/>;
                }
                if(canRenderHashtag && !rest.disabled && !rest.readOnly){
                    const nRight = <Icon {...props} icon={"format-header-pound"} style={[right||cRight?{marginLeft:-5}:null,props.style]} title={"Cliquer insérer un hashtag, ie faire référence à une données de ventes, d'achas, de stocks, de règlement..."} onPress={this.sprintf.bind(this)}/>;
                    right = right ? <>{right}{nRight}</> : nRight;
                }
                return (cRight)? <>{cRight}{right}</> : right;
            };
            rest.right = this.canRightPropsBeFunction() ? renderRigth : renderRigth({});
        } else {
            rest.right = customRight;
        }
        const hasWrapper = !isFilter ? true : false;
        const wrapperProps = hasWrapper ? Object.assign({},responsiveProps) : {};
        if(hasWrapper){
            const rP = {};
            if(_type =='switch' || _type =='checkbox' || _type =='image'){
                rP.justifyContent = 'center';
            }
            if(_type =='image'){
                if(rest.displayLabel === false){
                    delete rest.label;
                    rP.alignItems = 'center';
                    rP.width = "100%";
                }
            }
            wrapperProps.style = [{marginVertical:10},responsive !== false?grid.col(windowWidth):{width:'100%'},rP,wrapperProps.style];
        }
        if(isFunction(getProps)){
            rest = {...rest,...defaultObj(getProps.call(this,{...rest,context:this}))};
        }
        rest.context = this;
        this.removeNotAllowedProps(rest,{formName:this.formName,context:this});
        rest.setRef = this.setRef.bind(this);
        rest.isFilter = isFilter;
        rest.type = this.type;
        if(format){
            rest.format = format;
        }
        
        rest.onBlur = this.onBlurField.bind(this);
        rest.autoComplete = "off";
        rest.errorText = this.state.errorText;
        rest.helperText = this.state.errorText;
        rest.error = this.state.error;
        rest.onFocus = this.onFocusField.bind(this);
        rest.testID = defaultStr(rest.testID,"RN_FormField_"+this.getName());
        if(this.canHandleWidthOrHeightProps()){
            if(width){
                rest.width = width;
            }
            if(height){
                rest.height = height;
            }
        }
        return  <KeyboardEventHandler formFieldName={this.getName()} testID={'RN_FormFieldContainer_'+this.getName()} innerRef={this.wrapperRef} {...wrapperProps}
                handleKeys={this.keybaordEvents}
                onKeyEvent = {this.onKeyEvent.bind(this)}
                isDisabled = {rest.disabled}
            >
                {(kProps)=>{
                    return this._render({...rest,...kProps},this.setRef.bind(this))
                }}
        </KeyboardEventHandler>
    }
}

Field.propTypes = {
    left : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]),
    right : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]),
    usePlaceholderWhenEmpty : PropTypes.bool,//si la valeur du placeholder sera utilée, lorsque la valeur du champ de type formatable est nulle ou égale à la valeur vide
    responsive : PropTypes.bool,
    responsiveProps : PropTypes.object,
    ///la valeur à retourner au cas où defaultValue est non définie pour la formField
    _defaultValue : PropTypes.any,
    /*** fonction de rappel, appélée immédiatement que la validation a réussie par le validateur.
     * Si cette fonction retourne un message non null ou un objet contenant la prop msg ou message non null, alors celui-ci est considéré comme une erreur
     */
    onValidatorValid : PropTypes.func,
    /*** le format dans lequel sera rendu le contenu du textfield */
    format : PropTypes.string,
    //la liste d'évènements du clavier à écouter
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
    onKeyEvent : PropTypes.func, /*** l'évènement global appelé lorsqu'on clique sur une touche */
    onKeyEvent : PropTypes.func/*** l'évènement global appelé lorsqu'on clique sur une champ de la form */,
    id: PropTypes.string,
    /**** l'on peut décider que la field ait la possibilité d'exploiter le gestion de validateur ou pas
     *  dans ce cas, il suffit de renseigner la props validate à true ou à false
     */
    validate : PropTypes.bool,
    /***function utile pour définir dynamiquement 
        certaines props de la field; 
     *  fonction appelée pour retourner les props à passer au composant
        Elle prend en paramètre : les props passés au composant de la field, ainsi que l'objet data
        et doit retourner un objet props final qui sera passé à la field
     *  cette fonction prend en paramètre : 
     *      -1. l'objet props, représentant les props courant de la field
     *      -2. l'objet data, représentant les données actuelle passées à la field
     *  la valeur des props retournés doit être une fusions avec les props initiaux
     */
    /*cette 
        
    */
    getProps : PropTypes.func, //cette fonction est utile pour permettre de retourner les props par défaut de la field
    disabled : PropTypes.oneOfType([PropTypes.func,PropTypes.bool,PropTypes.string]),
    readOnly : PropTypes.oneOfType([PropTypes.func,PropTypes.bool,PropTypes.string]),
    visible : PropTypes.oneOfType([PropTypes.func,PropTypes.bool]),
    text : PropTypes.string,
    label : PropTypes.string,//le libelé du champ, idem à text
    value : PropTypes.any,
    /*** tous les champs doivent avoir un nom définit dans la prop name */
    //name : PropTypes.string.isRequired,
    defaultValue : PropTypes.any,
    selected : PropTypes.any,
    formName : PropTypes.string.isRequired,
    name : PropTypes.oneOfType([PropTypes.string]).isRequired,
    required : PropTypes.bool,
    /*** cette fonction est appelée lorsque la field est validée */
    onValidate : PropTypes.func,
    /*** la propriété onChange prend en paramètre un callback, qui est prend en paramètre
        la nouvelle valeur, et l'évènement qui est à l'origine
        */
    onChange : PropTypes.func,
    /*** le noeud de la text field à utiliser */      
    onNoValidate : PropTypes.func,
    validParams : PropTypes.oneOfType([PropTypes.object,PropTypes.array]),
    validType : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
    ]),
    validRule : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
    ]),
    required : PropTypes.oneOfType([
        PropTypes.bool, //si c'est un boolean
    ]),
    /*** cette props est définie par le composant Filter : 
     *   Elle permet tout simplement de spécifier que le rendu sera un champ de filtre
     *   Lorsqu'elle est définie alors le rendu lors du composant doit être de type filter 
     */
    renderfilter : PropTypes.string, 
    /*** cette fonction doit retourner l'instance de la field
        elle doit toujours être définie dans la classe qui hérite directement au composant Field
    */
    /////getFieldInstance : PropTypes.func.IsRequired,
}

const styles = StyleSheet.create({
    icon : {
        marginHorizontal : 0
    }
})