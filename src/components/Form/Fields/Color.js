import Color from "$components/Color";
import Field from "./Field";

export default class FormColorField extends Field {
    canFocus(){
        return false;
    }
    _render(props,setRef){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <Color
            {...props}
            setRef = {setRef}
        />
    }
}

FormColorField.propTypes = {
    ...Color.PropTypes
}