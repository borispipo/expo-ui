import { FAB } from 'react-native-paper';
import {defaultObj} from "$cutils";
import React from "$react";
import { StyleSheet } from 'react-native';
import PropTypes from "prop-types";
import theme,{Colors} from "$theme";

const FabComponent = React.forwardRef((props,ref)=>{
    const {primary,secondary,style:customStyle,color:customColor,...restP} = props;
    const rest = defaultObj(restP);
    const style = Object.assign({},StyleSheet.flatten(customStyle));
    let color = Colors.isValid(customColor)? customColor : undefined;
    let backgroundColor = Colors.isValid(style.backgroundColor)? style.backgroundColor : undefined;
    if(!backgroundColor || primary){
        backgroundColor = theme.colors.primary;
        color = theme.colors.onPrimary;
    } else if(secondary){
        backgroundColor = theme.colors.secondary;
        color = theme.colors.onSecondary;
    }
    return  <FAB
        testID='RN_FabComponent'
        {...rest}
        color = {color}
        style = {[styles.fab,style,{backgroundColor}]}
    />
})

FabComponent.propTTypes = {
    ...defaultObj(FAB.propTypes),
    color : PropTypes.string,
    primary : PropTypes.bool,
    secondary : PropTypes.bool,
}
const styles = StyleSheet.create({
    fab : {
        position: 'absolute',
        margin: 15,
        bottom : 0,
    }
})

export default FabComponent;

FabComponent.displayName = "FabComponent";