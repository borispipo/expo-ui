///@see : https://github.com/vivaxy/react-native-auto-height-image
import React, { useEffect, useState, useRef } from '$react';
import ImagePolyfill from './ImagePolyfill';
import AnimatableImage from './AnimatableImage';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native-paper';
import theme from "$theme";
import View from "$ecomponents/View";
import {defaultStr} from "$cutils";

import { getImageSizeFitWidth, getImageSizeFitWidthFromCache } from './cache';
import { NOOP, DEFAULT_HEIGHT } from './helpers';

const {...ImagePropTypes } = AnimatableImage.propTypes;

function AutoHeightImage(props) {
  const {
    onHeightChange,
    source,
    width,
    style,
    maxHeight,
    onError,
    testID:cTestID,
    preloader,
    ...rest
  } = props;
  const [height, setHeight] = useState(
    getImageSizeFitWidthFromCache(source, width, maxHeight).height ||
      DEFAULT_HEIGHT
  );
  const mountedRef = useRef(false);
  const toolgeMounted = function () {
    mountedRef.current = true;
    return function () {
      mountedRef.current = false;
    };
  }
  useEffect(toolgeMounted,[])
  React.useOnRender(toolgeMounted,0);
  useEffect(
    function () {
      (async function () {
        try {
          const { height: newHeight } = await getImageSizeFitWidth(
            source,
            width,
            maxHeight
          );
          if (mountedRef.current) {
            // might trigger `onHeightChange` with same `height` value
            // dedupe maybe?
            setHeight(newHeight);
            onHeightChange(newHeight);
          }
        } catch (e) {
          if(onError){
            onError(e);
          }
        }
      })();
    },
    [source, onHeightChange, width, maxHeight]
  );

  // StyleSheet.create will cache styles, not what we want
  const imageStyles = { width, height };
  const testID = defaultStr(cTestID,"RN_AutoHeightImageComponent")
  // Since it only makes sense to use polyfill with remote images
  const ImageComponent = source.uri ? ImagePolyfill : AnimatableImage;
  return (<View testID={testID+"_Container"} style={{flexDirection:'row'}}>
      <ImageComponent
        testID = {testID}
        source={source}
        style={[imageStyles, style]}
        onError={onError}
        {...rest}
      />
      {!mountedRef.current && preloader !== false && (!width || !height) ? <ActivityIndicator testID={testID+"_ActivityIndicator"} color={theme.colors.primary}/> : null}
  </View>
  );
}

AutoHeightImage.propTypes = {
  ...ImagePropTypes,
  width: PropTypes.number.isRequired,
  maxHeight: PropTypes.number,
  onHeightChange: PropTypes.func,
  animated: PropTypes.bool,
  preloader : PropTypes.bool,//si l'on affichera le preloader
};

AutoHeightImage.defaultProps = {
  maxHeight: Infinity,
  onHeightChange: NOOP,
  animated: false,
  preloader : true,
};

export default AutoHeightImage;