import barcodes from 'jsbarcode/src/barcodes';
import PropTypes from "prop-types";
import {defaultObj} from "$cutils";

export const barcodeFormats = Object.keys(barcodes);

export const defaultBarcodeFormat = 'CODE128';

export const jsbarcodePropTypes = {
    value : PropTypes.string,
    format : PropTypes.oneOf(barcodeFormats),
    width : PropTypes.number, //The width option is the width of a single bar., default : 2
    height : PropTypes.number,//The height of the barcode., default 100,
    text : PropTypes.string, //Overide the text that is diplayed
    displayValue : PropTypes.bool,
    fontOptions : PropTypes.string,//With fontOptions you can add bold or italic text to the barcode.
    font : PropTypes.string,
    textAlign : PropTypes.oneOf(["center","left","right"]), //Set the horizontal alignment of the text. Can be left / center / right.
    textPosition : PropTypes.oneOf(["bottom","top"]),//Set the vertical position of the text. Can be bottom / top., default bottom
    textMargin : PropTypes.number,//default : 2, Set the space between the barcode and the text.
    fontSize : PropTypes.number,//Set the size of the text., default : 20,
    flat : PropTypes.bool, //Only for EAN8/EAN13
    background : PropTypes.string,//Set the background of the barcode., default #ffffff
    lineColor: PropTypes.string,//Set the color of the bars and the text., default #000000
    margin : PropTypes.number,//deafult : 10, Set the space margin around the barcode. If nothing else is set, all side will inherit the margins property but can be replaced if you want to set them separably.
    marginTop : PropTypes.number,
    marginBottom : PropTypes.number,
    marginLeft : PropTypes.number,
    marginRight : PropTypes.number,
    errorText : PropTypes.node,
    valid : PropTypes.func,//function(valid){}	
}

export const JSBarcodePropTypes = jsbarcodePropTypes;

export const prepareOptions = ({textPosition,fontOptions,fontSize,textMargin,textAlign,margin,marginLeft,marginRight,marginTop,marginBottom})=>{
    const displayChildOnTop = defaultStr(textPosition,"bottom").toLowerCase().trim() ==="top";
    fontOptions = defaultStr(fontOptions,"bold").toLowerCase();
    textMargin = typeof textMargin =="number"? textMargin : 2;
    const style = {
        fontSize:defaultNumber(fontSize,20),
        textAlign : ["center","left","right"].includes(textAlign)  && textAlign ||"center",
        backgroundColor : "transparent",
    };
    if(fontOptions.includes("bold")){
        style.fontWeight = "bold";
    }
    if(fontOptions.includes("italic")){
        style.fontStyle = "italic";
    }
    if(displayChildOnTop){
        style.marginBottom = textMargin;
    } else style.marginTop = textMargin;
    margin = typeof margin =='number' ? margin : 10;
    const svgStyle = {};
    Object.map({marginTop,marginBottom,marginLeft,marginRight},(v,i)=>{
        svgStyle[i] = typeof v =='number'? v : margin;
    });
    return {
        displayChildOnTop,
        fontOptions,
        svgStyle,
        style,
    }
}