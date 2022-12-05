import SelectField from "../SelectField";
import SelectTableData from "./Component";

export default class FormSelectTableDataField extends SelectField{
    _render(props){
        return <SelectTableData 
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

FormSelectTableDataField.propTypes = {
    ...SelectTableData.propTypes
}

