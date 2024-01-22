import React,{forwardRef,useEffect} from "$react";
import Svg, { Path } from 'react-native-svg';
import Label from "$ecomponents/Label";
import {defaultStr,defaultNumber} from "$cutils";
import theme from "$theme";
import View from "$ecomponents/View";
import { prepareOptions } from "./utils";
const BarcodeGeneratorComponent = forwardRef(({width,height,lineColor,bars,value,onReady,format,id,testID,text,flat,displayValue,fontOptions,font,textAlign,textPosition,textMargin,fontSize,backgroun,margin,marginTop,marginBottom,marginLeft,marginRight,containerProps},ref)=>{
    testID = defaultStr(testID,"RNBarCodeGeneratorComponent");
    const child = React.isValidElement(text,true)? text : displayValue !== false && value || null;
    const {style,svgStyle,displayChildOnTop} = prepareOptions({textPosition,fontOptions,fontSize,textMargin,textAlign,margin,marginLeft,marginRight,marginTop,marginBottom});
    const children = child? <Label
        testID = {`${testID}_Label`}
        style = {[theme.styles.w100,style,theme.Colors.isValid(lineColor) && {color:lineColor}]}
    >{child}</Label> : null;
    useEffect(()=>{
        if(typeof onReady =='function'){
            setTimeout(onReady,50);
        }
    },[width,height,lineColor,bars,value,format,id,testID,text,flat,displayValue,fontOptions,font,textAlign,textPosition,textMargin,fontSize,backgroun,margin,marginTop,marginBottom,marginLeft,marginRight])
    containerProps = Object.assign({},containerProps);
    return <View ref = {ref} id={id} testID={testID+"_Container"} {...containerProps} style={[{alignSelf:"center"},containerProps.style]}>
        {displayChildOnTop ? chilren : null}
        <Svg 
            testID={testID}
            height={height} width={width} fill={lineColor}
            style = {svgStyle}
          >
            <Path d={bars.join(' ')} />
        </Svg>
        {!displayChildOnTop ? children : null}
    </View>
});

BarcodeGeneratorComponent.displayName = "BarcodeGeneratorComponent";

export default BarcodeGeneratorComponent;