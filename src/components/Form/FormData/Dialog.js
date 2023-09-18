import Dialog from "$ecomponents/Dialog/Dialog";
import FormDataActions from "./FormDataActions";
import {defaultObj} from "$cutils";
import React from "$react";
import PropTypes from "prop-types";

export default class FormDataDialogComponent extends FormDataActions{
    constructor(props){
        super(props);
        Object.defineProperties(this,{
            DialogComponent : {
                value : this.getDialogComponent(),
            },
            INITIAL_STATE : {value:{}},
            dialogRef : {value:React.createRef(null)}
        });
    }
    isControlled(){
        const dialogProps = defaultObj(this.props.dialogProps,this.props);
        return dialogProps.controlled ? dialogProps.controlled : typeof this.props.controlled =='boolean'? this.props.controlled : true;
    }
    getDialogComponent(){
        return this.isControlled() ? Dialog.Controlled : Dialog;
    }
    
    close (args){
        if(this.isControlled()){
            if(this.dialogRef.current && this.dialogRef.current.close){
                return this.dialogRef.current.close(args);
            }
        }
        const dialogProps = defaultObj(this.props.dialogProps);
        if(dialogProps.onDismiss){
            return dialogProps.onDismiss({context:this});
        } else if(dialogProps.onClose){
            return dialogProps.onClose({context:this});
        }
    }
    onCancel(args){
        const onCancel = this.props.onCancel;
        args = {...defaultObj(args),context:this,editingData:this.getData(),data:this.getDataProp(),props:this.props};
        if(onCancel && onCancel(args) === false){
            return;
        }
        this.close(args);
    }
    doSave2Close(){}
    doSave2New(){}
    doSave(){}
    getComponentProps (props){
        this.INITIAL_STATE.props = this.getAppBarActionsProps(props);
        let {fields,data,formProps}  = this.INITIAL_STATE.props;
        formProps = Object.assign({},formProps);
        formProps.data = data;
        formProps.fields = defaultObj(formProps.fields,fields);
        this.INITIAL_STATE.props.formProps = formProps;
        return this.INITIAL_STATE.props;
    }
    getDialogRef(){
        return this.dialogRef;
    }
    getDialogContext(){
        return this.dialogRef.current;
    }
    _render(content){
        content = super._render(content);
        const Component = this.DialogComponent;
        const aA = this.INITIAL_STATE.props;
        delete aA.fullScreen;delete aA.fullPage;
        return <Component 
            isFormData
            testID = {'RN_FormDataDialogComponent'}
            responsive
            visible = {this.props.visible}
            title = {this.props.title}
            subtitle = {this.props.subtitle}
            {...defaultObj(this.props.dialogProps)}
            {...aA}
            ref = {this.dialogRef}
            onBackActionPress = {this.onBackActionPress.bind(this)}
        >
            {content}
        </Component>
    }
}

FormDataDialogComponent.Controlled = React.forwardRef((props,ref)=>{
    return <FormDataDialogComponent testID={'RN_FormDataDialogComponentControlled'} {...props} ref={ref} controlled/>
});

FormDataDialogComponent.Controlled.displayName = "FormDataDialogComponent.Controlled";

FormDataDialogComponent.propTypes = {
    ...FormDataActions.propTypes,
    confirmOnCancel : PropTypes.bool,///si l'on doit confirmer vouloir annuler la modification
    dialogProps : PropTypes.shape({
        ...Dialog.propTypes,
    }),
    open : PropTypes.func, //la fonction appelée pour ouvrir la boîte de dialogue
    close : PropTypes.func, //la fonction appelée pour fermer la boîte de dialogue
    containerProps : PropTypes.object,
    contentProps : PropTypes.object,
    preloader : PropTypes.any,
    preloaderProps : PropTypes.object,
    headerContent : PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.node
    ]),
    dialogProps : PropTypes.object,//les props du dialog
}