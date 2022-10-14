import PhoneInput from "$components/PhoneInput";
import Field from "./Field";

export default class FormPhoneInputField extends Field {
    canFocus(){
        return false;
    }
    _render(props,setRef){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <PhoneInput
            {...props}
            setRef = {setRef}
        />
    }
}

FormPhoneInputField.propTypes = {
    ...PhoneInput.PropTypes
}