import SelectField from "./SelectField";
import {selectDateFormatFieldProps,getDateFormatSelectorItems} from "$ecomponents/Date/FormatSelector";

export default class FormFieldSelectDateFormat extends SelectField{
    constructor(props){
        super(props);
        Object.defineProperties(this,{
            itemsRef : {value : {current : getDateFormatSelectorItems()}},
            valueRef : {value : {current : undefined}},
        });
    }
    getComponentProps(props){
        const {onAdd} = props;
        const rest = selectDateFormatFieldProps({
            ...props,onAdd : (args)=>{
                if(onAdd &&  onAdd(args) === false){
                    return false;
                }
                const {value,label} = args;
                const code = value+"-"+value;
                const it = {[code]:{code : value, label : label || new Date().toFormat(value)}}
                Object.map(this.itemsRef.current,(v,k)=>{
                    it[k] = v;
                });
                this.valueRef.current = value;
                if(this._field && this._field.refresh && this._field.prepareItems){
                    this._field.setState(this._field.prepareItems({items:it,defaultValue:value}))
                }
            }
        });
        rest.items = this.itemsRef.current;
        if(this.valueRef.current){
            rest.defaultValue = this.valueRef.current;
        }
        this.valueRef.current = undefined;
        return rest;
    }
    _render(props){
        return super._render(this.getComponentProps(props))
    }
}

FormFieldSelectDateFormat.propTypes = {
    ...SelectField.propTypes,
}