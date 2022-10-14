import SelectField from "./SelectField";
import {getThemeFieldProps} from "$theme/components/SelectTheme";

export default class FormFieldSelectTheme extends SelectField{
    getComponentProps(props){
        return {...getThemeFieldProps(),...defaultObj(props)}
    }
    _render(props){
        return super._render(this.getComponentProps(props))
    }
}