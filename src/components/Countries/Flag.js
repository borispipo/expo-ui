import React from "$react";
import Image from "$ecomponents/Image";
import { getCountry,styles} from "./utils";
import {isNonNullString,defaultStr,isNumber} from "$cutils";
import View from "$ecomponents/View"
import theme from "$theme";
import Label from "$ecomponents/Label";

export default function CountryFlagComponent({code,label,withName,withCode,text,containerProps,labelProps,withLabel,testID,...props}){
    if(!isNonNullString(code)) return null;
    const country = getCountry(code);
    testID = defaultStr(testID,"RN_CountryFlagComponent");
    if(!country) return <Label testID={testID+"_NotFoundCode"}>{code}</Label>;
    //console.log(country," is county");
    containerProps = Object.assign({},containerProps);
    labelProps = Object.assign({},labelProps);
    return <View  {...containerProps} testID={testID} style={[theme.styles.row,containerProps.style]}>
        {(isNonNullString(country.image) || isNumber(country.image)) ? 
            <Image  
            accessibilityIgnoresInvertColors 
            testID ={testID+"Image"}
            readOnly = {true}
            {...props}
            size = {25} 
            style={[props.style]} 
            src={country.image}
        /> : null}
        {<Label testID={testID+"_Label"} {...labelProps} style={[labelProps.style,{marginLeft:5}]}>
            {withName || withLabel ? country.name : withCode ? country.code.toUpperCase() : null}
        </Label>}
    </View>
}