import SelectField from "./SelectField";
import {getCountryFieldProps} from "$components/Countries";
import {defaultVal} from "$utils";

export default class FormFieldSelectCountry extends SelectField{
    getComponentProps(props){
        return {...getCountryFieldProps(),...defaultObj(props)}
    }
    _render(props){
        return super._render(this.getComponentProps(props))
    }
}