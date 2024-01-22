import React, { useMemo } from '$react';
import PropTypes from 'prop-types';
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import Svg, { Path } from 'react-native-svg';
import barcodes from 'jsbarcode/src/barcodes';
import theme from "$theme";
import {defaultStr,defaultObj,isNonNullString} from "$cutils";

export const barCodeFormats = Object.keys(barcodes);

const Barcode = ({
  value = '',
  width = 2,
  height = 100,
  format,
  color,
  text,
  testID,
  textStyle,
  style:cStyle,
  onError,
  maxWidth,
  svgProps,
  header,
  childrenProps,
  ...rest
}) => {
  testID = defaultStr(testID,"RNBarcodeGenerator");
  svgProps = defaultObj(svgProps);
   const style = theme.flattenStyle(cStyle);
  style.backgroundColor = theme.Colors.isValid(style.backgroundColor)? style.backgroundColor : '#ffffff';
  color = theme.Colors.isValid(color)? color : '#000000';
  header = typeof header =="string" && header ? <Label testID={`${testID}_Header`} style={[{color}]}>header</Label> : React.isComponent(header)? header : null;
  children = typeof children =="string" && children ? <Label testID={`${testID}_Header`} style={[theme.styles.textAlignCenter,{color}]}>children</Label> : React.isComponent(children)? children : null;
  if(!isNonNullString(format)){
    format = 'CODE128';
  } else if(!barCodeFormats.includes(format)){
    console.warn(`Format de code bar [${format}] est invalide, il sera remplacé par le format 'CODE128'. Vous devez spécifier un format parmi la liste : [${barCodeFormats.join(",")}]`,children,rest)
    format = 'CODE128';
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

  const encode = (text, Encoder) => {
    if (typeof text !== 'string' || text.length === 0) {
      throw new Error('Barcode value must be a non-empty string');
    }
    const encoder = new Encoder(text, {
      width,
      format,
      height,
      color,
      flat: true,
    });
    if (!encoder.valid()) {
      throw new Error('Invalid barcode for selected format.');
    }
    return encoder.encode();
  };

  const { bars, barCodeWidth } = useMemo(() => {
    try {
      const encoder = barcodes[format];
      if (!encoder) {
        throw new Error('Invalid barcode format.');
      }
      const encoded = encode(value, encoder);
      const barCodeWidth = encoded.data.length * width;
      return {
        bars: drawSvgBarCode(encoded),
        barCodeWidth:
          typeof maxWidth === 'number' && barCodeWidth > maxWidth
            ? maxWidth
            : barCodeWidth,
      };
    } catch (error) {
      if (__DEV__) {
        console.error(error.message);
      }
      if (onError) {
        onError(error);
      }
    }
    return {
      bars: [],
      barCodeWidth: 0,
    };
  }, [value, width, height, format, color, maxWidth]);

  return (
    <View
      {...rest}
      style={[theme.styles.alignItemsCenter,style]}
      testID = {testID}
    >
      <Svg 
        height={height} width={barCodeWidth} fill={color}
        {...svgProps}
      >
        <Path d={bars.join(' ')} />
      </Svg>
      {children ?  <Label>{children}</Label> : null}
    </View>
  );
};

Barcode.propTypes = {
  value: PropTypes.string.isRequired,
  header : PropTypes.node,//le header à afficher
  format: PropTypes.oneOf(barCodeFormats),
  width: PropTypes.number,
  maxWidth: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,//la couleur des ligne du code barre généré
  text: PropTypes.node,
  textStyle: PropTypes.object,
  style: PropTypes.object,
  onError: PropTypes.func,
};

export default Barcode;