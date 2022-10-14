import React from "$react";
import SimpleSelect from "$components/SimpleSelect";
import { countries } from "./utils";
import View from "$components/View";
import {StyleSheet,Image} from "react-native";
import {defaultObj} from "$utils";
import PropTypes from "prop-types";
import {isNonNullString,isNumber,defaultStr} from "$utils";
import Label from "$components/Label";

/**** retourne les props du champ de type countrie */
export const getCountryFieldProps = (props)=>{
    props = defaultObj(props);
    let {imageProps,...rest} = props;
    imageProps = defaultObj(imageProps);
    return {
        text : 'Pays',
        type : 'select',
        items : countries,
        dialogProps : {title:'Sélectionner un pays'},
        getItemValue : ({item})=>item.code,
        compare : (a,b)=>{
            return typeof a ==='string' && typeof b =='string' && a.toLowerCase() === b.toLowerCase() ? true : false; 
        },
        renderItem : ({item})=>{
            return <View style={[styles.renderedImage]}>
                {(isNonNullString(item.image) || isNumber(item.image)) && <Image  accessibilityIgnoresInvertColors {...imageProps} style={[styles.flagImage,{marginRight:10},imageProps.style]} source={isNumber(item.image)?item.image:{uri:item.image}}/>}
                <Label>{item.label}</Label>
            </View>
        },
        ...defaultObj(rest),
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

const styles = StyleSheet.create({
    renderedImage : {
        flexDirection : "row",
        alignItems : 'center',
        justifyContent : 'flex-start',
        flex : 1,
    },
    flagImage : {
        borderWidth:0,
        width : 30,
        height : 20,
    },
})


