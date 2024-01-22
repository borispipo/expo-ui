import {forwardRef,useRef,useEffect} from "$react";
import {uniqid,defaultStr} from "$cutils";
import JsBarcode from "jsbarcode";
import {jsbarcodePropTypes } from "./utils";

///@see : https://lindell.me/JsBarcode/
const BarcodeGeneratorComponent = forwardRef(({value,format,id,testID,onReady,text,flat,width,height,displayValue,fontOptions,font,textAlign,textPosition,textMargin,fontSize,background,lineColor,margin,marginTop,marginBottom,marginLeft,marginRight,valid},ref)=>{
    testID = defaultStr(testID,"RN_GeneratorWebSVG");
    const idRef = useRef(defaultStr(id,uniqid("bar-code-generator-web")));
    useEffect(()=>{
        const element = document.querySelector(`#${idRef.current}`);
        if(!element) return;
        JsBarcode(`#${idRef.current}`).init();
        if(typeof onReady ==="function"){
            setTimeout(()=>{
                onReady();
            },50);
        }
    },[value,format,id,testID,width,height,displayValue,flat,text,fontOptions,font,textAlign,textPosition,textMargin,fontSize,background,lineColor,margin,marginTop,marginBottom,marginLeft,marginRight])
    const jsProps = {};
    const supportedProps = {value,format,width,flat,text,height,displayValue,fontOptions,font,textAlign,textPosition,textMargin,fontSize,background,lineColor,margin,marginTop,marginBottom,marginLeft,marginRight};
    Object.keys(supportedProps).map(key=>{
        if(supportedProps[key] !== undefined){
            jsProps[`jsbarcode-${key.toLowerCase()}`] = String(supportedProps[key]);
        }
    });
    return <svg {...jsProps} id={`${idRef.current}`} ref={ref} data-test-id={`${testID}`} className="bar-code-generator-svg"/>
});

BarcodeGeneratorComponent.displayName = "BarcodeGeneratorComponent";

BarcodeGeneratorComponent.propTypes = jsbarcodePropTypes

export default BarcodeGeneratorComponent;