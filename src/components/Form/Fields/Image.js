import Field from "./Field";
import Image from "$ecomponents/Image";
import PropTypes from "prop-types";
import {defaultVal} from "$cutils";
export default class FormFieldImage extends Field {
    constructor(props){
        super(props)
        this.autobind();
    }
    canHandleWidthOrHeightProps(){
        return true;
    }
    canFocus(){
        return false;
    }
    isValid(){
        return true;
    }
    onChange(args){
        let {dataUrl}= args;
        const previousValue = this.getPreviousValue();
        if(previousValue === dataUrl && previousValue){
            return ;
        }
        this.validate({...args,value:dataUrl,context:this});
    }
    getComponent(){
        return Image;
    }
    _render({onChange,...p}){
        return <Image
           {...p}
           src={defaultVal(p.src,p.defaultValue)}
           onChange={this.onChange.bind(this)}
        />
    }
    isTextField(){
        return false;
    }
}

FormFieldImage.propTypes = {
    width : PropTypes.number,
    height : PropTypes.number,
    ...Field.propTypes
}
