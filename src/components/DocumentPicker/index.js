import Button from "$ecomponents/Button";
import React from "$react";
import PropTypes from "prop-types";
import { pickDocument } from "$emedia/document";

const DocumentPickerComponent = React.forwardRef(({pickOptions,onSuccess,onCancel,onPress,...props},ref)=>{
    return <Button 
        onPress = {(...r)=>{
            if(typeof onPress =="function" && onPress(...r) === false) return;
            pickDocument(pickOptions).then((r)=>{
                if(typeof onSuccess =="function"){
                    onSuccess(r);
                }
            }).catch((r)=>{
                if(typeof onCancel =="function"){
                    onCancel(r);
                }
            });
        }}
        ref={ref} {...props}/>
});

DocumentPickerComponent.displayName = "DocumentPickerComponent";

export default DocumentPickerComponent;

DocumentPickerComponent.propTypes = {
    ...Object.assign({},Button.propTypes),
    onSuccess : PropTypes.func,
    onCancel : PropTypes.func,
    /*** @see : https://docs.expo.dev/versions/latest/sdk/document-picker/#documentpickeroptions */
    pickOptions : PropTypes.shape({
        copyToCacheDirectory : PropTypes.bool,
        multiple : PropTypes.bool,
        /*** @seee : https://en.wikipedia.org/wiki/Media_type */
        type : PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string),
        ])
    }),
}