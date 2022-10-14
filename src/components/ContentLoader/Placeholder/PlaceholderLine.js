import React from "react";
import { Animated, StyleSheet} from "react-native";
import View from "$components/View";
import { useAnimation } from "./animations/context";
import { COLORS, SIZES } from "./tokens";
import PropTypes from "prop-types";
import {StyleTypeProps} from "$theme";
import { getBackgroundColor } from "../utils";

const PlaceholderLine  = ({
  height = SIZES.normal,
  color,
  width = 100,
  noMargin = false,
  style,
}) => {
  color = getBackgroundColor(color);
  const backgroundColor = color;
  const borderRadius = height / 4;
  const marginBottom = noMargin ? 0 : height;

  const computedStyle = {
    backgroundColor,
    borderRadius,
    height,
    marginBottom,
    width: `${width}%`,
  };

  const animationStyle = useAnimation();

  return (
    <View style={[computedStyle, style, styles.line]}>
      <Animated.View style={animationStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    overflow: "hidden",
  },
});


PlaceholderLine.propTypes = {
  /* The line height, default is 12  */
  height : PropTypes.number,
  /* The line color, default is #efefef  */
  color : PropTypes.string,
  /* The line width in percent, default is 100(%)  */
  width : PropTypes.number,
  /* Defines if a line should have a margin bottom or not, default is false */
  noMargin : PropTypes.bool,
  /* Customize the style of the underlying View component */
  style : StyleTypeProps
}

export default PlaceholderLine;