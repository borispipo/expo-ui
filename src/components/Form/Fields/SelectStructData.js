import SelectField from "./SelectField";
import SelectStructData from "$containers/StructData/SelectField";

export default class FormSelectStructDataField extends SelectField{
    _render(props){
        return <SelectStructData 
            {...props}
            onChange = {(args)=>{
                this.validateWithCallOnChange(args);
                if(typeof this.props.onChange =='function'){
                    this.props.onChange(args);
                }
            }}
            ref = {(el)=>{
                this._field = el;
            }}
        />
    }
}

FormSelectStructDataField.propTypes = {
    ...SelectStructData.propTypes,
}

