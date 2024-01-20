import {TouchableRipple as RNTouchableRipple} from "react-native-paper";
import React from "$react";
import PropTypes from "prop-types";

/***@see : https://reactnative.dev/docs/pressable#rippleconfig */
const TouchableRipple = React.forwardRef(({android_ripple,rippleColor,disabledRipple,disabled,readOnly,...rest},ref)=>{
    return <RNTouchableRipple
        ref = {ref}
        rippleColor = {disabledRipple||disabled||readOnly ? 'transparent':rippleColor}
        {...rest}
    />
});
TouchableRipple.displayName = "TouchableRippleComponent";

export default TouchableRipple;

TouchableRipple.propTypes = {
    ...Object.assign({},RNTouchableRipple.propTypes),
    disabledRipple : PropTypes.bool,//si le ripple sera désactivé
    disabled : PropTypes.bool,
    readOnly : PropTypes.bool
}