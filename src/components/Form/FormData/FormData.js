import {getAppBarActionsProps} from "./utils";
import React, {ObservableComponent as AppComponent} from "$react";
import {isNonNullString,defaultStr,defaultNumber,defaultObj,extendObj,isObj,isFunction,defaultFunc,uniqid} from "$cutils";
import {getForm,getFormField} from "../utils";
import Surface from "$ecomponents/Surface";
import Form from "../Form";
import theme,{flattenStyle} from "$theme";
import PropTypes from "prop-types";
import {renderActions} from "$ecomponents/Dialog/utils";
import {handleBeforeSaveCallback} from "./utils";
import isDbDocEditing,{checkPrimaryKey} from "../utils/isDocEditing";
import keyboardShortcuts from "../utils/keyboardShortcuts";
import FieldsContent from "./FieldsContent";

export default class FormDataComponent extends AppComponent{
    constructor(props){
        super(props);
        const formName = defaultStr(this.props.formName,uniqid("form-id")) 
        Object.defineProperties(this,{
            formName : {
                value : formName,
            },
            getFormName : {
                value : x=> formName,
            },
            isAllowed : {
                value : isNonNullString(this.props.perm) ? Auth.isAllowedFromStr(this.props.perm) : true
            },
        });
    }
    getForm (){
        return getForm(this.getFormName());
    }
    getFormField (fieldName){
        return getFormField(formName,fieldName);
    }
    getField(fieldName){
        return getFormField(this.getFormName(),fieldName)
    }
    getData(...args){
        return this.getFormData(...args);
    }
    getFormData(){
        const form = this.getForm();
        if(form){
            return form.getData();
        }
        return {};
    }
    actionMutator(args){
        const a2 = typeof this.props.actionMutator =='function'? this.props.actionMutator(args) :args.action;
        if(!isObj(a2)) return null;
        return a2;
    }
    getAppBarProps(){
        return defaultObj(this.props.appBarProps);
    }
    beforeSave(){
        return true;
    }
    canCallOnSuccess(){
        return true;
    }
    onSave(args){
        return true;
    }
    reset(args){
        return null;
    }
    isValid(...args){
        return this.isFormValid(...args);
    }
    isFormValid(...args){
        return this.getForm()?.isValid(...args);
    }
    getErrorText(){
        return this.getForm()?.getErrorText();
    }
    getAppBarActionsProps(props){
        let {data,onCancel,perm,beforeSaveArgumentsMutator,beforeSave,actions,saveDataMutator,...rest} = (defaultObj(props,this.props));
        const onSave = typeof props.onSave ==='function'? props.onSave : this.props.onSave ;
        beforeSave = typeof beforeSave =='function'? beforeSave : x=>true;
        return getAppBarActionsProps({
            ...defaultObj(rest),
            ...this.getAppBarProps(),
            actions,
            actionMutator : this.actionMutator.bind(this),
            formName : this.getFormName(),
            data:Object.assign({},data),
            save :(args)=>{
                setTimeout(()=>{
                    const form = this.getForm();
                    if(!form || !form.isValid) return false;
                    if(!form.isValid()){
                        const errorText = form.getErrorText();
                        if(errorText){
                            return "Impossible d'enregister les données à cause l'erreur suivante : "+errorText;
                        }
                    }
                    const isUpdated = this.isDocEditing(args.data);
                    const currentIndex = this.getCurrentIndex();
                    const action = typeof this.clickedAction =='string' ? this.clickedAction.toLowerCase() : '';
                    const savedArgs = {...args,isUpdated,context:this,action,currentIndex,index:currentIndex,isUpdate:isUpdated,isUpdated,props:this.props,context:this};
                    if(beforeSaveArgumentsMutator){
                        savedArgs = beforeSaveArgumentsMutator(savedArgs);
                        if(!isObj(savedArgs)){
                            savedArgs = {...savedArgs,data}
                        }
                    }
                    if(typeof saveDataMutator =='function'){
                        saveDataMutator(savedArgs);
                    }
                    return handleBeforeSaveCallback(this.beforeSave.bind(this),()=>{
                        return handleBeforeSaveCallback(beforeSave,()=>{
                            return handleBeforeSaveCallback(this.onSave.bind(this),()=>{
                                return handleBeforeSaveCallback(onSave,()=>{
                                    if(action == 'save2close'){
                                        ///on appelle la fonction qui enregistre et ferme
                                        this.doSave2Close(savedArgs)
                                    } else if(action == 'save2new' || action ==='new'){
                                        ///on appelle la fonction qui enregistre et crèe un nouveau
                                        this.doSave2New({...savedArgs,index:undefined,data:{}});
                                    } else {
                                        ///on appelle la fonction qui enregistre et reste sur la page
                                        this.doSave(savedArgs);
                                    }
                                    if(this.canCallOnSuccess()){
                                        if(typeof this.props.onSuccess =="function"){
                                            this.props.onSuccess(savedArgs);
                                        } else if(onSave !== this.props.onSave && typeof this.props.onSave =="function"){
                                            this.props.onSave(savedArgs);
                                        }
                                    }
                                },savedArgs);
                            },savedArgs);
                        },savedArgs);
                    },savedArgs);
                },0);
            },
            cancel:(args)=>{
                this.onCancel(args);
            }
        });
    }
    onCancel(args){
        if(isFunction(this.props.onCancel)){
            onCancel({...defaultObj(args),context:this,editingData:this.getData(),data:this.getDataProp(),props:this.props});
        }
    }
    /*** cette fonction est appelée pour enregistrer les données */
    doSave(args){}
    ///cette fonction est appelée pour enregistrer et fermer la page
    doSave2Close(args){}
    ////cette fonction est appelée pour enregister et créer un noveau
    doSave2New(args){}
    createNew(args){}
    getCurrentIndex(){
        return undefined;
    }
    isDocEditing (data){
        data = defaultObj(data);
        if(typeof this.props.isDocEditing =='function'){
            return this.props.isDocEditing(data,{context:this}) ? true : false;
        } else if(typeof this.props.isDocUpdate =='function'){
            return this.props.isDocUpdate(data,{context:this}) ? true : false;
        }
        return isObj(this.formDataPrimaryKeyFields) && Object.size(this.formDataPrimaryKeyFields,true) ? isDbDocEditing(data,this.formDataPrimaryKeyFields,({index:field,data})=>{
            return checkPrimaryKey(data,field);
        }) : false;
    }
    canBindResizeEvents(){
        return false;
    }
    componentDidMount(){
        super.componentDidMount();
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        this.clearEvents();
    }
    close(){

    }
    onBackActionPress(){
        return true;
    }
    getDataProp (){
        return Object.assign({},this.props.data);
    }
    getFormName (){
        return this.formName;
    }
    isArchivable (){
        return false;
    }
    getActions (){
        return renderActions(this.getAppBarActionsProps());
    }
    _render (content){
        return React.isValidElement(content)? content : null;
    }
    /*** les props à utiliser pour le rendu du composant, dans la méthode render */
    getComponentProps (props){
        return props;
    }
    /*** les props qui seront passé au composant Wrapper au moment du rendu du composant FormData 
     * appélé dans la méthode _render
    */
    getRenderingProps (){
        return this.props;
    }
    handleCustomRender(){
        return false;
    }
    onKeyEvent(event){
        event = defaultObj(event);
        event.targetContext = this;
        const {onKeyEvent} = this.props;
        if(isFunction(onKeyEvent) && onKeyEvent({...event,context:this,data:this.getDataProp()}) === false){
            return false;
        } 
        let key = defaultStr(event.key).toLowerCase();
        if(key === 'esc'){
            this.onBackActionPress({close:this.close.bind(this)});
            return false;
        } 
        if(keyboardShortcuts[key]){
            event.formKeyEventAction = keyboardShortcuts[key];
            return event;
        }
        return false;
    }
    render (){
        const props = defaultObj(this.getComponentProps(this.props));
        this.componentWillRender(props);
        let {
            data,
            actions,
            fields,
            saveButton,
            saveButtonIcon,
            formProps,
            closeAfterSave,
            readOnly,
            component,
            disabled,
            onValidate,
            onNoValidate,
            onValidateField,
            responsive,
            responsiveProps,
            header,
            children,
            ignoreFields, //la liste des champs à ignorer lors du parcours des champs
            toolbarProps,
            text,
            showActionsOnTop,
            getFieldProps, ///pour ajouter des champs supplémentaires aux props de la field
            title,
            onMount,
            windowWidth,
            onUnmount,
            isRenderedByFormPage,
            archivable,
            onKeyEvent,
            isFormDataDialog,
            onAddPressOnDropdownFieldCallback,
            onAddPressOnDropdownField,
            archived,
            withBottomSheet,
            isAllowed,
            isDocEditing,
            beforeSave,
            onSave,
            saveDataMutator,
            beforeSaveArgumentsMutator,
            ...containerProps
        } = props;
        if(typeof isAllowed ==='function'){
            isAllowed = isAllowed({...props,data:defaultObj(data),context:this})
        } else isAllowed = true;
        if(isAllowed === false || !this.isAllowed){
            Auth.showError();
            return null;
        }
        formProps = Object.assign({},formProps);
        formProps.onNoValidate = onNoValidate;
        formProps.onValidate = onValidate;
        formProps.onNoValidate = onNoValidate;
        formProps.onValidateField = function(){
            if(isFunction(onValidateField)){
                onValidateField.apply(this,Array.prototype.slice.call(arguments,0))
            }
        };
        containerProps = Object.assign({},containerProps);
        const cStyle = flattenStyle([styles.container,{backgroundColor:theme.surfaceBackgroundColor},containerProps.style]);
        formProps.style = flattenStyle([{backgroundColor:cStyle.backgroundColor},formProps.style]);
        data = isObj(formProps.data) ? formProps.data : isObj(data) ? data : {};
        ///getting fields content
        this.formDataPrimaryKeyFields = defaultObj(this.primaryKeyFields);
        const content = <Form 
            {...formProps} 
            windowWidth = {defaultNumber(formProps.windowWidth,windowWidth) || undefined}
            name={this.getFormName()}
            onKeyEvent = {this.onKeyEvent.bind(this)}
            data = {data}
        >
            <FieldsContent
                {...formProps}
                fields = {defaultObj(formProps.fields,fields)}
                fieldProps = {defaultObj(formProps.fieldProps,this.props.fieldProps)}
                style = {flattenStyle(formProps.style)}
                data = {data}
                responsive = {typeof formProps.responsive =='boolean' ? formProps.responsive : this.props.responsive !== false ? true : false}
                responsiveProps = {extendObj({},this.props.responsiveProps,formProps.responsiveProps)}
                windowWidth = {defaultNumber(formProps.windowWidth,this.props.windowWidth) || undefined}
                primaryKeyFields = {this.formDataPrimaryKeyFields}
                formName = {this.getFormName()}
                disabled = {this.props.disabled}
                archived = {this.props.archived || data?.archived && true || false}
                archivable = {this.props.archivable || this.isArchivable()}
                onLoopField={(opts)=>{
                    this.formDataPrimaryKeyFields = defaultObj(this.formDataPrimaryKeyFields);
                    if(opts.primaryKey){
                        this.formDataPrimaryKeyFields[opts.name] = true;
                    } else {
                        delete this.formDataPrimaryKeyFields[opts.name];
                    }
                    if(typeof this.props.onLoopField ==='function'){
                        this.props.onLoopField(opts)
                    }
                }}
            />
        </Form>
        if(this.handleCustomRender()){
            return this._render({
                header,
                context : this,
                content,
            });
        }
        if(typeof children ==='function'){
            return this._render(children({
                header,
                context : this,
                content,
            }));
        }
        return this._render(<Surface primary testID={'RN_FormDataComponent'} {...containerProps} style={cStyle}>
            {React.isValidElement(header,true)?header : null}
            {content}
            {React.isValidElement(children)? children : null}
        </Surface>);
    }
}

FormDataComponent.propTypes = {
    fieldProps : PropTypes.object,//les props à passer à chacun des fields
    onKeyEvent : PropTypes.func,
    isDocEditing : PropTypes.func,///permet de spécifier si le document en cours est en modification
    windowWidth : PropTypes.number,///la taille de la fenêtre à considérer pour le responsive
    isFormDataDialog : PropTypes.bool, //si la form data est rendu dans une boîte de dialogue
    onMount : PropTypes.func,
    onUnmount : PropTypes.func,
    withBottomSheet : PropTypes.bool,//si les éléments de formFields sera rendu en utilisant le bottomSheet, surtout les éléments de type select
    children : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element
    ]),
    beforeSaveArgumentsMutator : PropTypes.func,
    header : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
    ]),
    onLoopField : PropTypes.func,//la fonction appelée lorsqu'on boucle sur un champ du form data
}

const styles = {
    container : {
        height : '100%',
        flexDirection : 'column',
        justifyContent : 'flex-start',
        alignItems : 'flex-start',
        paddingBottom : 30,
    },
}