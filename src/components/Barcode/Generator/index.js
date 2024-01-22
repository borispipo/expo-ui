import React, { useMemo,forwardRef,useEffect,defaultNumber,useRef,useMergeRefs} from '$react';
import PropTypes from 'prop-types';
import barcodes from 'jsbarcode/src/barcodes';
import theme,{StyleProp} from "$theme";
import {defaultStr,defaultObj,isNonNullString,extendObj,uniqid,isDataURL} from "$cutils";
import Generator from "./Generator";
import {isMobileNative} from "$cplatform";
import { defaultBarcodeFormat,barcodeFormats,jsbarcodePropTypes,encode } from './utils';
import { captureRef } from '$expo-ui/view-shot';
import Base64 from "$base64";
import Label from "$ecomponents/Label";

export * from "./utils";

const BarcodeGenerator = forwardRef(({
  value = '',
  width = 2,
  height = 100,
  format,
  lineColor,
  children,
  testID,
  style:cStyle,
  onError,
  autoConvertToDataURL,
  onConvertToDataURL,
  maxWidth,
  background,
  dataURLOptions,
  id,
  ...rest
},ref) => {
  dataURLOptions = defaultObj(dataURLOptions);
  testID = defaultStr(testID,"RNBarcodeGenerator");
  const innerRef = useRef(null);
  const isReadyRef = useRef(false);
  const setReady = ()=> isReadyRef.current = true;
   const style = theme.flattenStyle(cStyle);
   const idRef = useRef(defaultStr(id,uniqid("bar-code-generator-web")));
  background = theme.Colors.isValid(background) ? background :  style.backgroundColor = theme.Colors.isValid(style.backgroundColor)? style.backgroundColor : '#ffffff';
  lineColor = theme.Colors.isValid(lineColor)? lineColor : '#000000';
  if(!isNonNullString(format)){
    format = defaultBarcodeFormat;
  } else if(!barcodeFormats.includes(format)){
    console.warn(`Format de code bar [${format}] est invalide, il sera remplacé par le format [${defaultBarcodeFormat}]. Vous devez spécifier un format parmi la liste : [${barcodeFormats.join(",")}]`,children,rest)
    format = defaultBarcodeFormat;
  }
  const drawRect = (x, y, width, height) => {
    return `M${x},${y}h${width}v${height}h-${width}z`;
  };

  const drawSvgBarCode = (encoded) => {
    const rects = [];
    const { data: binary } = encoded;

    const barCodeWidth = binary.length * width;
    const singleBarWidth =
      typeof maxWidth === 'number' && barCodeWidth > maxWidth
        ? maxWidth / binary.length
        : width;
    let barWidth = 0;
    let x = 0;
    let yFrom = 0;

    for (let b = 0; b < binary.length; b++) {
      x = b * singleBarWidth;
      if (binary[b] === '1') {
        barWidth++;
      } else if (barWidth > 0) {
        rects[rects.length] = drawRect(
          x - singleBarWidth * barWidth,
          yFrom,
          singleBarWidth * barWidth,
          height,
        );
        barWidth = 0;
      }
    }

    if (barWidth > 0) {
      rects[rects.length] = drawRect(
        x - singleBarWidth * (barWidth - 1),
        yFrom,
        singleBarWidth * barWidth,
        height,
      );
    }

    return rects;
  };

  

  const { bars, barCodeWidth,error } = useMemo(() => {
    try {
      if(!value){
        throw new Error(`Valeur du code barre invalide!!\n Merci de spécifier une valeur non nulle`)
      }
      const encoded = encode({value,width,height,format,lineColor,maxWidth});
      if(!encoded){
        throw new Error(`code barre ${value} invalide pour le format sélectionné ${format}`);
      }
      const barCodeWidth = encoded.data.length * width;
      return {
        bars: drawSvgBarCode(encoded),
        error : false,
        barCodeWidth:
          typeof maxWidth === 'number' && barCodeWidth > maxWidth
            ? maxWidth
            : barCodeWidth,
      };
    } catch (error) {
      if (onError) {
        onError(error);
      }
      return {
        bars: [],
        barCodeWidth: 0,
        error,
      };
    }
  }, [value, width, height, format, lineColor, maxWidth]);
  useEffect(()=>{
    if(autoConvertToDataURL === true){
      toDataURL();
    }
  },[format,value,width,height,lineColor])
  const toDataURL = ()=>{
    return new Promise((resolve,reject)=>{
      const cb2 = (x, y, width, height) => {
        const cb = ()=>{
          return captureRef(innerRef.current,extendObj({},{
            quality: 1,
            format: 'png',
            result : "data-uri",
            width,
            height,
          },dataURLOptions)).then((r)=>{
              if(isDataURL(r) && typeof onConvertToDataURL =="function"){
                onConvertToDataURL({dataURL:r});
              }
              resolve({dataURL:r,width,height});
          }).catch((e)=>{
            console.log(e," is capturing data url");
            reject(e);
          });
        }
        if(!isReadyRef.current){
          return setTimeout(cb,50);
        }
        return cb(); 
      };
      if(!isMobileNative() && typeof document !=="undefined" && typeof document?.querySelector =='function'){
        const element = document.querySelector(`#${idRef.current}`);
        if(element && typeof element?.getBoundingClientRect =='function'){
          const {width,height} = element.getBoundingClientRect();
          return cb2(undefined,undefined,width,height);
        }
      }
      return innerRef.current?.measureInWindow(cb2);
    })
  }
  return (<Generator
    {...rest}
    errorText = {error ? <Label style={{textAlign:'center'}} error fontSize={15} textBold>
    {error?.toString()}
  </Label>: null}
    id = {idRef.current}
    onReady = {setReady}
    value = {value}
    bars = {bars}
    format = {format}
    error = {error}
    testID = {testID}
    background = {background}
    width = {isMobileNative()?barCodeWidth:width}
    height = {height}
    lineColor = {lineColor}
    ref = {(el)=>{
      if(el){
        el.toDataURL = toDataURL;
      }
      innerRef.current = el;
      React.setRef(ref,el);
    }}
  />);
});

BarcodeGenerator.propTypes = {
  value: PropTypes.string,
  ...jsbarcodePropTypes,
  dataURLOptions : PropTypes.object,//les options à utiliser pour la convertion en data url
  onConvertToDataURL : PropTypes.func,//lorsque la valeur est converti au format data url
  maxWidth: PropTypes.number,
  style: StyleProp,
  onError: PropTypes.func,
  autoConvertToDataURL : PropTypes.bool,//si la valeur sera auto converti en url lorsque le composant sera monté
};

export default BarcodeGenerator;