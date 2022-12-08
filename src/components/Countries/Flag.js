import React from "$react";
import Image from "$components/Image";
import { getCountry,styles} from "./utils";
import {isNonNullString,defaultStr,isNumber} from "$utils";
import View from "$ecomponents/View"
import theme from "$theme";
import Label from "$components/Label";

export default function CountryFlagComponent({code,label,withName,withCode,text,containerProps,labelProps,withLabel,tesID,...props}){
    if(!isNonNullString(code)) return null;
    const country = getCountry(code);
    tesID = defaultStr(tesID,"RN_CountryFlagComponent");
    if(!country) return <Label tesID={tesID+"_NotFoundCode"}>{code}</Label>;
    //console.log(country," is county");
    containerProps = Object.assign({},containerProps);
    labelProps = Object.assign({},labelProps);
    return <View  {...containerProps} testID={tesID} style={[theme.styles.row,containerProps.style]}>
        {(isNonNullString(country.image) || isNumber(country.image)) ? 
            <Image  
            accessibilityIgnoresInvertColors 
            tesID ={tesID+"Image"}
            {...props}
            size = {25} 
            style={[props.style]} 
            src={country.image}
        /> : null}
        {<Label tesID={tesID+"_Label"} {...labelProps} style={[labelProps.style,{marginLeft:5}]}>
            {withName || withLabel ? country.name : withCode ? country.code.toUpperCase() : null}
        </Label>}
    </View>
}