import React from "$react";
import Checkbox from "$ecomponents/Checkbox";
import PropTypes from "prop-types";
import {defaultStr,defaultVal,defaultObj} from "$cutils";
import { StyleSheet } from "react-native";
import theme from "$theme";

const PermText = React.forwardRef(({isUserMasterAdmin,disabled,assignPerm,testID,text,title,label,checked,labelStyle,table,type,onToggle,actions,action,resource,tooltip,...props},ref)=>{
    testID = defaultStr(testID,"RN_AuthPermTextComponent");
    return <Checkbox
        title = {tooltip || title}
        ref = {ref}
        testID = {testID}
        disabled = {disabled || isUserMasterAdmin}
        defaultValue = {checked || isUserMasterAdmin?1 : 0}
        style  = {[theme.styles.noPadding,theme.styles.noMarging,labelStyle !== false && styles.checkbox]}
        labelStyle = {[labelStyle !== false && styles.label,labelStyle && labelStyle]}
        label = {defaultVal(label,text)}
        onPress = {(args)=>{
            React.stopEventPropagation(args?.event);
            if(onToggle){
                onToggle({...args,...props,checked:!!!checked,resource,actions,action,table,type})
            }
            return false;
        }}
    />
})

PermText.displayName = "AuthPermTextComponent";
export default PermText;

PermText.propTypes = {
    ...defaultObj(Checkbox.propTypes),
    table : PropTypes.string,
    type : PropTypes.string,//le type de données pour la table passée en paramètre
    action : PropTypes.string,
    //actions : PropTypes.arrayOf(PropTypes.string),
    resource : PropTypes.string,
    labelStyle : PropTypes.oneOfType([
        PropTypes.bool,
        theme.StyleProp,
    ]),
}

const styles = StyleSheet.create({
    expandableContent : {
        paddingLeft : 30,
    },
    expandable : {
        paddingLeft : 10,
    },
    label : {fontSize:14},
    permChildren : {
        paddingLeft : 20,
    },
    checkbox : {
        //width : 20,
        //height : 20,
        margin : 0,
        padding: 0,
    }
});