import PhoneInput from "$ecomponents/PhoneInput";
import Field from "./Field";
import appConfig from "$capp/config";

export default class FormPhoneInputField extends Field {
    canFocus(){
        return false;
    }
    _render(props,setRef){
        props.onChange = (args)=>{
            this.validate(args);
        }
        props.country = defaultStr(props.country,appConfig.countryCode,appConfig.get("countryCode","country"))
        return <PhoneInput
            {...props}
            setRef = {setRef}
        />
    }
}

FormPhoneInputField.propTypes = {
    ...PhoneInput.PropTypes
}