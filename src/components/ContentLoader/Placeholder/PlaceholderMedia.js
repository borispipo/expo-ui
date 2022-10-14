import React from "react";
import { Animated, StyleSheet} from "react-native";
import View from "$ecomponents/View";
import { useAnimation } from "./animations/context";
import { COLORS, SIZES } from "./tokens";
import PropTypes from "prop-types";
import {StyleTypeProps} from "$theme";


export const PlaceholderMedia = ({
  size = SIZES.xxl,
  isRound = false,
  color = COLORS.primary,
  style,
}) => {
  const computedStyles = {
    backgroundColor: color,
    borderRadius: isRound ? size / 2 : 3,
    height: size,
    width: size,
  };

  const animationStyle = useAnimation();

  return (
    <View style={[computedStyles, style, styles.media]}>
      <Animated.View style={animationStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  media: {
    overflow: "hidden",
  },
});

PlaceholderMedia.PropTypes = {
  /* The media size (height / width), default is 40  */
  size : PropTypes.number,
  /* Defines if the media is rounded or not, default is false */
  isRound:PropTypes.boolean,
  /* The media color, default is #efefef  */
  color:PropTypes.string,
  /* Customize the style of the underlying View component */
  style:StyleTypeProps
}
