import SelectField from "./SelectField";
import {getCountryFieldProps} from "$ecomponents/Countries";

export default class FormFieldSelectCountry extends SelectField{
    _render(props){
        return super._render(getCountryFieldProps(props))
    }
}
FormFieldSelectCountry.propTypes = {
    ...SelectField.propTypes,
}