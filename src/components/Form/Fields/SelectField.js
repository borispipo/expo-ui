import Field from "./Field";
import Dropdown from "$ecomponents/Dropdown";
import PropTypes from "prop-types";
import {isObj} from "$cutils";
export default class FormSelectField extends Field{
    constructor(props) {
        super(props);
        this.autobind();
    }
    isTextField(){
        return false;
    }
    componentDidMount(){
        super.componentDidMount(false); 
        if(!this.isFilter()){
            let value = this.getDefaultValue();
            if(this._field){
                if(typeof this._field.prepareSelected ==='function'){
                    value = this._field.prepareSelected({defaultValue:value});   
                } else if(typeof this._field.getSelectedValue =='function'){
                    value = this._field.getSelectedValue();
                } 
            }
            this.validate({context:this,value});
        }
        return;
    }
    getDefaultValue(){
        if(this._field){
            if(typeof this._field.getDefaultValue =='function'){
                return this._field.getDefaultValue();
            } 
        }
        return super.getDefaultValue();
    }
    refresh (force,cb){
        if(this._field && isFunction(this._field.refresh)){
            this._field.refresh(force,cb);
        }
    }
    selectValue(val,reset,cb){
        if(this._field && isFunction(this._field.selectValue)){
            this._field.selectValue(val,reset,cb);
        } else {
            this.validate({value:val});
        }
    }
    isSelectField(){
        return !this.isFilter();
    }
    getValue () {
        if(this._field && isFunction(this._field?.getSelected)){
            let selectedItems = this._field.getSelectedItems(true);
            if(Object.size(selectedItems,true)<=0) {
                return this.props.multiple ? []  : undefined;
            }
            return this._field.getSelected();
        }
        return super.getValue();
    }
    getSelectedItems (force){
        if(this._field && isFunction(this._field?.getSelected)){
            return this._field.getSelectedItems(force);
        }
        return null;
    }
    hasNoValidSelectedValue(){
        if(this._field && isFunction(this._field?.hasNoValidSelectedValue)){
            return this._field.hasNoValidSelectedValue();
        }
        return undefined;
    }
    isValid11(...args){
        if(this.hasNoValidSelectedValue() === true) return false;
        return super.isValid(...args);
    }
    getSelectedItem(index){
        let items = this.getSelectedItems(true);
        if(typeof index !== 'undefined' && isObjOrArray(items)){
            if(items[index] !== undefined) return items[index];
        }
        if(this._field){
            if(this.props.multiple !== false){
                return items;
            } else if(this._field) {
                return this._field.currentSelectedItem;
            }
        }
        return null;
    }
    setValue (value,reset,cb){
        if(this._field && isFunction(this._field.selectValue)){
           this._field.selectValue(value,reset,cb);
        }
        return super.setValue(value,reset,cb);
    }
    removeNotAllowedProps(props,{formName}){
        return;
    }
    validateWithCallOnChange(args){
        const {value,selectedItems,selectedItem,items}= args;
        const multiple = typeof this.props.multiple =='boolean'? this.props.multiple : false;
        this.validate({value,item:selectedItem,multiple,selectedItem,selectedItems,items});
    }
    validate(args){
        if(this._field && isObj(this._field.state) && typeof this._field.getValueKey =='function' && typeof this._field.getSelectedItems =='function'){
            if(!args.selectedItems){
                args.selectedItems = this._field.getSelectedItems();
            }
            args.value = this._field.prepareSelected({defaultValue:args.value})
            if(!(typeof this._field.canHandleMultiple =='function' && this._field.canHandleMultiple()) && !args.selectedItem){
                const valueKey = this._field.getValueKey(args.value);
                if(valueKey && isObj(this._field.state.valuesKeys) && this._field.state.valuesKeys[valueKey]){
                    args.selectedItem = args.item = this._field.state.valuesKeys[valueKey].item;
                }
            }
        }
        return super.validate(args);
    }
    _render (componentProps){
        let {
            getInstance,
            ...props
        } = componentProps;
        delete props.format;
        delete props.import;
        delete props.exports;
        return <Dropdown
            {...props}
            ref = {(el)=>{
                this._field = el;
            }}
            onMount = {({context,...rest})=>{
                this._field = context;
                if(typeof props.onMount =='function'){
                   props.onMount({context,...rest});
                }
            }}
            onChange = {this.validateWithCallOnChange.bind(this)}
        />
    }
}

FormSelectField.propTypes = {
    ...Dropdown.propTypes,
    ...Field.propTypes,
    format : PropTypes.string,
    /*** en cas de mise à jour la dropdown se transforme en une zone de texte ayant pour valeur la valeur sélectionnée 
     *  et le champ désactivé
    */
    isUpdate : PropTypes.bool,
}