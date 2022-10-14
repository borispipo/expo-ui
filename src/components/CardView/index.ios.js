import React from '$react';
import View from "$ecomponents/View";
import PropTypes from "prop-types";

export default function CardViewComponent (props) {
  const { cardElevation, cornerRadius, shadowOpacity = 0.24 } = props;
    if(cardElevation > 0) {
      return(
        <View style={[{
          shadowOffset: {
            width: 0,
            height: cardElevation
          },
          shadowRadius: cardElevation,
          shadowOpacity: shadowOpacity,
          borderRadius: cornerRadius,
        }, props.style]}>
          {props.children}
        </View>
      );
    } else {
      return(
        <View style={[{
          borderRadius: cornerRadius,
        }, props.style]}>
          {props.children}
        </View>
      );
    }
}

CardViewComponent.propTypes = {
  cardElevation : PropTypes.number,
  cornerRadius : PropTypes.number,
  shadowOpacity : PropTypes.number
}