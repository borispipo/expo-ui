import SelectField from "./SelectField";
import SelectFontIcon from "$ecomponents/Icon/SelectFontIcon";

export default class FormFieldSelectFontIcon extends SelectField{
    _render (props){
        return <SelectFontIcon
            {...props}
            ref = {(el)=>{
                this._field = el;
            }}
            onMount = {({context,...rest})=>{
                this._field = context;
                if(typeof props.onMount =='function'){
                    props.onMount({context,...rest});
                 }
            }}
            onChange = {(args)=>{
                this.validateWithCallOnChange(args);
                if(typeof props.onChange =='function'){
                    props.onChange(args);
                }
            }}
        />
    }
}
FormFieldSelectFontIcon.propTypes = {
    ...SelectField.propTypes,
}