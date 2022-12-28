import Format from "$ecomponents/SelectCurrency/Format";
import TextField  from"./TextField";
export default class CurrencyFormatField extends TextField{
    _render(props,setRef){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <Format
            {...props}
            setRef = {setRef}
        />
    }
}


CurrencyFormatField.propTypes = {
    ...TextField.propTypes,
}