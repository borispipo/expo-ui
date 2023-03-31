import React from '$react';
import {Image,StyleSheet,TouchableOpacity} from 'react-native';
import PropTypes from "prop-types";
import { StyleProp } from '$theme';
import {defaultStr,isNumber,defaultNumber} from "$cutils";
import AutoHeightImage from "./AutoHeightImage";

export const SIZE = 64;

export const MIN_SIZE = 30;
const isV = x=> isNumber(x) && x ? true : false;

const AvatarImage = React.forwardRef(({
  size = SIZE,
  source,
  style,
  width,
  height,
  onError,
  onLayout,
  onLoad,
  onLoadEnd,
  onLoadStart,
  onProgress,
  testID,
  imageProps,
  rounded,
  ...rest
},ref) => {
  imageProps = defaultObj(imageProps);
  testID = defaultStr(testID,'RN_AvatarImageComponent');
  const isRounded = rounded !== false ? true : false;
  let borderRadius = 0;
  const flattenedStyle = StyleSheet.flatten(style) || {};
  width = width || flattenedStyle.width;
  height = height || flattenedStyle.height;
  if(isRounded && isV(size)){
    width = height = size;
    borderRadius = size / 2;
  }
  const hasImage = isV(width) && isV(height) && (isRounded || width === height);
  const C = hasImage ? Image : AutoHeightImage;
  if(!isV(width)){
    width = defaultNumber(height,MIN_SIZE);
  }
  const cProps = !hasImage? {width,height} : {};
  return (
    <TouchableOpacity
      ref = {ref}
      testID = {testID}
      style={[
        isRounded && {
          width,
          height,
          borderRadius,
        },
        flattenedStyle,
        !isRounded && {borderRadius:0},
      ]}
      {...rest}
    >
      {typeof source === 'function' && source({ size })}
      {typeof source !== 'function' && (
        <C
          testID={testID+"_Image"}
          source={source}
          {...cProps}
          {...imageProps}
          style={[
            hasImage && { width,height,borderRadius},
            //!hasImage &&  width && {width},
          ]}
          onError={onError}
          onLayout={onLayout}
          onLoad={onLoad}
          onLoadEnd={onLoadEnd}
          onLoadStart={onLoadStart}
          onProgress={onProgress}
        />
      )}
    </TouchableOpacity>
  );
});

AvatarImage.displayName = 'Avatar.Image';

AvatarImage.propTypes = {
  rounded : PropTypes.bool,
  source: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
    PropTypes.func,
  ]),
  /**
   * Size of the avatar.
   */
  size : PropTypes.number,
  style : StyleProp,
  onError : PropTypes.func,
  onLayout : PropTypes.func,
  onLoad : PropTypes.func,
  onLoadEnd : PropTypes.func,
  onLoadStart : PropTypes.func,
  onProgress : PropTypes.func,
  width : PropTypes.oneOfType([
    //PropTypes.string,
    PropTypes.number,
  ]),
  height : PropTypes.oneOfType([
    //PropTypes.string,
    PropTypes.number,
  ])
}

export default AvatarImage;