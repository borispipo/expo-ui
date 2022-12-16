import SelectField from "./SelectField";
import {selectCurrencyFieldProps} from "$ecomponents/SelectCurrency";
import appConfig from "$app/config";
import {defaultStr} from "$utils";

export default class FormFieldSelectCurrency extends SelectField{
    constructor(props){
        super(props);
        Object.defineProperties(this,{
            currencyFormatRef : {value : {current:defaultStr(appConfig.currencyFormat)}}
        });
    }
    onValidate(args){
        const {context} = args;
        if(context && context.getField){
            const field = context.getField("currencyFormat");
            if(field && field.setValue){
                field.setValue(defaultStr(this.currencyFormatRef.current));
            }
        }
        super.onValidate(args);
    }
    getComponentProps(props){
        this.currencyFormatRef.current = defaultStr(props.currencyFormat,this.currencyFormatRef.current,appConfig.currencyFormat)
        return {...selectCurrencyFieldProps({...props,onChange:(args)=>{
            this.currencyFormatRef.current = defaultStr(args.currencyFormat);
            if(this.props.onChange){
                this.props.onChange(args);
            }
        }})}
    }
    getValidValue(data){
        data.currencyFormat = this.currencyFormatRef.current;
        return super.getValidValue(data);
    }
}
FormFieldSelectCurrency.propTypes = {
    ...SelectField.propTypes,
}