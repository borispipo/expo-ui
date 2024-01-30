import SelectField from "../SelectField";
import SelectTableData from "./Component";

export default class FormSelectTableDataField extends SelectField{
    _render(props){
        return <SelectTableData 
            {...props}
            onChange = {this.validateWithCallOnChange.bind(this)}
            beforeFetchItems = {(opts)=>{
                if(typeof props.beforeFetchItems =='function'){
                    return props.beforeFetchItems({...opts,context:this,dropdownContext : this._field})
                }
                return true;
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

