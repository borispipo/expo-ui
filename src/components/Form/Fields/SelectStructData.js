import SelectField from "./SelectField";
import SelectStructData from "$containers/StructData/SelectField";

export default class FormSelectStructDataField extends SelectField{
    _render(props){
        return <SelectStructData 
            {...props}
            onChange = {this.validateWithCallOnChange.bind(this)}
            ref = {(el)=>{
                this._field = el;
            }}
        />
    }
}

FormSelectStructDataField.propTypes = {
    ...SelectStructData.propTypes,
}

