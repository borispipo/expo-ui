import React,{forwardRef,useRef,useEffect} from "$react";
import {uniqid,defaultStr} from "$cutils";
import JsBarcode from "jsbarcode";
import {jsbarcodePropTypes } from "./utils";
import View from "$ecomponents/View";

///@see : https://lindell.me/JsBarcode/
const BarcodeGeneratorComponent = forwardRef(({value,format,id,errorText,testID,onReady,text,flat,width,height,displayValue,fontOptions,font,textAlign,textPosition,textMargin,fontSize,background,lineColor,margin,marginTop,marginBottom,marginLeft,marginRight,valid},ref)=>{
    testID = defaultStr(testID,"RN_GeneratorWebSVG");
    const idRef = useRef(defaultStr(id,uniqid("bar-code-generator-web")));
    const innerRef = useRef(null);
    const error = React.isValidElement(errorText)? errorText : null;
    if(error){
        displayValue = false;
    }
    const supportedProps = {format,width,flat,text,height,displayValue,fontOptions,font,textAlign,textPosition,textMargin,fontSize,background,lineColor,margin,marginTop,marginBottom,marginLeft,marginRight};
    useEffect(()=>{
        const element = document.querySelector(`#${idRef.current}`);
        if(!element) return;
        if(!error){
            try {
                JsBarcode(`#${idRef.current}`,value,supportedProps);
                if(typeof onReady ==="function"){
                    onReady();
                }
            } catch(e){}
        }
    },[value,error,format,width,height,displayValue,flat,text,fontOptions,font,textAlign,textPosition,textMargin,fontSize,background,lineColor,margin,marginTop,marginBottom,marginLeft,marginRight])
    if(error) return error;
    return <View style={[{alignSelf:'center'}]} ref={ref}>
        <canvas id={`${idRef.current}`} data-test-id={`${testID}`} className="bar-code-generator-svg"/>
    </View>
});

BarcodeGeneratorComponent.displayName = "BarcodeGeneratorComponent";

BarcodeGeneratorComponent.propTypes = jsbarcodePropTypes

export default BarcodeGeneratorComponent;