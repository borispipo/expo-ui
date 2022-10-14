import TextField from "$components/TextField";
import {defaultObj,isNonNullString} from "$utils";
import PropTypes from "prop-types";
import Field  from"./Field";
import React from "react";
export default class FormTextField extends Field{
    isTextField (){
        return true;
    }
    _render(props,setRef){
        props.onChange = (args)=>{
            this.validate(args);
        }
        return <TextField
            {...props}
            setRef = {setRef}
        />
    }
}


FormTextField.propTypes = {
    ...defaultObj(TextField.propTypes),
    ...Field.propTypes,
    id : PropTypes.string,
    type : PropTypes.string,    
    allowSpace : PropTypes.bool, //les tex
    placeholder:PropTypes.string,//le placeholder du champ
    errorText : PropTypes.string,
    error : PropTypes.bool,
    /*** si la valeur sera toujours en majuscule */
    upper : PropTypes.bool,
    upperCase : PropTypes.bool,
    format : PropTypes.oneOf([
        'currency',
        'money',
        "custom",
        "number",
        'hashtag',
        undefined,
        null,
        "",
    ]),
}