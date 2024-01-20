import {Pressable} from "react-native";
import React from "$react";
import PropTypes from "prop-types";
import { extendObj } from "$cutils";
import theme from "$theme";

/***@see : https://reactnative.dev/docs/pressable#rippleconfig */
const TouchableRipple = React.forwardRef(({android_ripple,disabled,disabledRipple,readOnly,...rest},ref)=>{
    return <Pressable
        ref = {ref}
        android_ripple={disabledRipple || android_ripple === false || disabled || readOnly  ? {} : extendObj({},{
            color : theme.Colors.setAlpha(theme.colors.onSurface,0.12),
            borderless : true,
            radius : 0,
            foreground : true,
        },android_ripple)}
        {...rest}
    />
});
TouchableRipple.displayName = "TouchableRippleComponent";

export default TouchableRipple;

TouchableRipple.propTypes = {
    ...Object.assign({},Pressable.propTypes),
    disabledRipple : PropTypes.bool, //alias de android_ripple
    disabled : PropTypes.bool,
    readOnly : PropTypes.bool,
    android_ripple : PropTypes.oneOf([
        PropTypes.bool,
        PropTypes.shape({
            color : PropTypes.string, //Defines the color of the ripple effect.
            borderless : PropTypes.bool, //Defines if ripple effect should not include border.
            radius : PropTypes.number, //Defines the radius of the ripple effect.
            foreground : PropTypes.bool, //Set to true to add the ripple effect to the foreground of the view, instead of the background. This is useful if one of your child views has a background of its own, or you're e.g. displaying images, and you don't want the ripple to be covered by them.
        })
    ])
}