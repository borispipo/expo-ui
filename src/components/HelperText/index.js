import { HelperText} from 'react-native-paper';
import { StyleSheet } from 'react-native';
import PropTypes from "prop-types";
import {defaultBool,defaultObj,isNonNullString} from "$cutils";
import React from "$react";
export const TYPES = {info:'info',error:'error'};
import theme,{DISABLED_OPACITY} from "$theme";

export default function HelperTextComponent (props){
    let {type,visible,style,children,error,...rest} = props;
    if(!isNonNullString(children)) return React.isValidElement(children)?children:null;
    rest = defaultObj(rest);
    type = defaultStr(type,'info').toLowerCase();
    const _style = {};
    if(!TYPES[type]) {
        type = TYPES.info;
    }
    if(error){
        type = TYPES.error;
        _style.color = theme.colors.error;
    }
    return <HelperText {...rest} style={[styles.padding,_style,style,rest.disabled?{opacity:DISABLED_OPACITY}:undefined]} padding={'none'} type={type} children={children} visible={defaultBool(visible,true)} />
}

HelperTextComponent.propTypes = {
    ...defaultObj(HelperText.propTypes),
    error : PropTypes.bool,
}

const styles = StyleSheet.create({
    padding: {
      paddingHorizontal: 0,
      paddingTop:0,
      paddingBottom : 5,
    },
  });