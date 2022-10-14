
import React from "$react";
import PropTypes from "prop-types";

const AffixComponent = React.forwardRef((props,ref)=>{
    const {children,focused} = props;
    if(!focused){
        return null; 
    }
    return children;
})
export default AffixComponent;
AffixComponent.popTypes = {
    onMount : PropTypes.func,
    onUnmount : PropTypes.func,
}

AffixComponent.displayName = "TextFieldAffixComponent";