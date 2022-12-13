import SelectField from "./SelectField";
import {getCountryFieldProps} from "$ecomponents/Countries";

export default class FormFieldSelectCountry extends SelectField{
    getComponentProps(props){
        return {...getCountryFieldProps(),...defaultObj(props)}
    }
    _render(props){
        return super._render(this.getComponentProps(props))
    }
}
FormFieldSelectCountry.propTypes = {
    ...SelectField.propTypes,
}