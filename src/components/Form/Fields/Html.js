import {defaultObj} from "$cutils";
import Field  from"./Field";
import React from "react";
export default class FormHtmlField extends Field{
    isHtml(){
        return true;
    }
    _render(props){
        const {render} = props;
        if(typeof render =='function'){
            const r = render(props);
            return React.isValidElement(r,true)? r : null;
        }
        return null;
    }
}


FormHtmlField.propTypes = {
    ...defaultObj(Field.propTypes),
}