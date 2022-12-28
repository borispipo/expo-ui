import SelectField from "./SelectField";
import {selectCurrencyFieldProps} from "$ecomponents/SelectCurrency";

export default class FormFieldSelectCurrency extends SelectField{
    constructor(props){
        super(props);
    }
    getComponentProps(props){
        return {...selectCurrencyFieldProps(props)}
    }
}

FormFieldSelectCurrency.propTypes = {
    ...SelectField.propTypes,
}