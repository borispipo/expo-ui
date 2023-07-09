import React from "$react";
import SimpleSelect from "$ecomponents/SimpleSelect";
import { countries,styles} from "./utils";
import View from "$ecomponents/View";
import {StyleSheet,Image} from "react-native";
import {defaultObj} from "$cutils";
import PropTypes from "prop-types";
import {isNonNullString,isNumber,defaultStr} from "$cutils";
import Label from "$ecomponents/Label";
import appConfig from "$capp/config";

/**** retourne les props du champ de type countrie */
export const getCountryFieldProps = (props)=>{
    props = defaultObj(props);
    let {imageProps,defaultValue,...rest} = props;
    const countryStr = defaultStr(appConfig.countryCode).toUpperCase();
    imageProps = defaultObj(imageProps);
    if(rest.multiple){
        if(isNonNullString(defaultValue)){
            defaultValue = defaultValue.split(",");
        }
        if(!defaultValue){
            defaultValue = [countryStr];
        }
    } else {
        defaultValue = defaultStr(defaultValue,countryStr);
    }
    return {
        label : defaultStr(props.label,props.text,'Pays'),
        type : 'select',
        items : countries,
        upper : true,
        dialogProps : {title:'Sélectionner un pays'},
        appConfigDefaultValueKey : "countryCode",
        getItemValue : ({item})=>item.code.toUpperCase(),
        renderText : ({item})=>"[{0}] {1}".sprintf(item?.code?.toUpperCase(),item?.label),
        compare : (a,b)=>{
            return typeof a ==='string' && typeof b =='string' && a.toLowerCase() === b.toLowerCase() ? true : false; 
        },
        renderItem : ({item})=>{
            return <View style={[styles.renderedImage]}>
                {(isNonNullString(item.image) || isNumber(item.image)) && <Image  readOnly= {true} accessibilityIgnoresInvertColors {...imageProps} style={[styles.flagImage,{marginRight:10},imageProps.style]} source={isNumber(item.image)?item.image:{uri:item.image}}/>}
                <Label>{item.label}</Label>
            </View>
        },
        ...defaultObj(rest),
        defaultValue,
    }
}

const SelectCoutryComponent = React.forwardRef((props,ref)=>{
    return <SimpleSelect
        {...getCountryFieldProps(props)}
        ref = {ref}
    />
})

SelectCoutryComponent.displayName ="SelectCoutryComponent";

export default SelectCoutryComponent;

SelectCoutryComponent.propTypes = {
    ...SimpleSelect.propTypes,
    imageProps : PropTypes.object, ///les props à appliquer aux images affichées
}




