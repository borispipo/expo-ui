import { Pressable } from "react-native";
import { forwardRef,useRef } from "react";
import PropTypes from "prop-types";

const PressableComponent = forwardRef(({onPress,pressDelay,onDoublePress,disabled,readOnly,...props},ref)=>{
    const lastPressRef = useRef=(0);
    pressDelay = typeof pressDelay =="number" && pressDelay > 10 ? pressDelay : 400;
    return <Pressable
        {...props}
        onPress = {disabled !== true && readOnly !== true ? (...rest)=>{
            const delta = new Date().getTime() - lastPressRef.current;
            lastPressRef.current = new Date().getTime();
            if(delta < pressDelay && typeof onDoublePress ==="function") {
                // double tap happend
                onDoublePress(...rest);
            }
            if(typeof onPress =="function"){
                onPress(...rest);
            }
        }: onPress}
    />
});

PressableComponent.displayName = "PressableComponent";

PressableComponent.propTypes = {
    ...Object.assign({},Pressable.propTypes),
    pressDelay : PropTypes.number, //le délai d'attente de l'action press, par défaut 400 milli secondes
    onDoublePress : PropTypes.func,
}