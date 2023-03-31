import { PropTypes } from 'prop-types';
import React from '$react';
import {defaultObj} from "$cutils";
import View from "$ecomponents/View";

import {
  requireNativeComponent,
  PixelRatio,
  Platform
} from 'react-native';
var iface = {
  name: 'CardView',
  propTypes: {
    cornerRadius: PropTypes.number,
    cardElevation: PropTypes.number,
    cardMaxElevation: PropTypes.number,
    ...defaultObj(View.propTypes) // include the default view properties
  }
};

const RNCardView = requireNativeComponent('RNCardView', iface);
export default function CardViewComponent(props){
    if (Platform.Version < 21) {
        const { cardMaxElevation = 1, cornerRadius = 1 } = props;
        const maxCardElevationPx = PixelRatio.getPixelSizeForLayoutSize(
          cardMaxElevation
        );
        const cornerRadiusPx = PixelRatio.getPixelSizeForLayoutSize(cornerRadius);
        const cos45 = 0.52532198881;
        const paddingBottom =
          maxCardElevationPx * 1.5 + (1 - cos45) * cornerRadiusPx;
        const paddingRight = maxCardElevationPx + (1 - cos45) * cornerRadiusPx;
        // equation from https://developer.android.com/reference/android/support/v7/widget/CardViewComponent
        return (
          <RNCardView {...props}>
            <View
              style={{
                paddingRight,
                paddingBottom
              }}
            >
              {props.children}
            </View>
          </RNCardView>
        );
    } else {
        return <RNCardView {...props}>{props.children}</RNCardView>;
    }
}

CardViewComponent.propTypes = {
    cardElevation : PropTypes.number,
    cornerRadius : PropTypes.number,
    shadowOpacity : PropTypes.number
  }