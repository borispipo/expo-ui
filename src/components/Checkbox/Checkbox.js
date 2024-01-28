import * as React from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import { TouchableRipple } from 'react-native-paper';
import PropTypes from "prop-types";
import FontIcon from "$ecomponents/Icon/Font";
import theme, {StyleProp} from "$theme";

const ANIMATION_DURATION = 100;

const CheckboxWeb = ({
  status,
  theme: themeOverrides,
  disabled,
  onPress,
  testID,
  rippleColor,
  color,
  ...rest
}) => {
  const { current: scaleAnim } = React.useRef(
    new Animated.Value(1)
  );
  const isFirstRendering = React.useRef(true);

  const {
    animation: { scale },
  } = theme;

  React.useEffect(() => {
    // Do not run animation on very first rendering
    if (isFirstRendering.current) {
      isFirstRendering.current = false;
      return;
    }

    const checked = status === 'checked';

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: checked ? ANIMATION_DURATION * scale : 0,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: checked
          ? ANIMATION_DURATION * scale
          : ANIMATION_DURATION * scale * 1.75,
        useNativeDriver: false,
      }),
    ]).start();
  }, [status, scaleAnim, scale]);

  const checked = status === 'checked';
  const indeterminate = status === 'indeterminate';

  const borderWidth = scaleAnim.interpolate({
    inputRange: [0.8, 1],
    outputRange: [7, 0],
  });

  const icon = indeterminate
    ? 'minus-box'
    : checked
    ? 'checkbox-marked'
    : 'checkbox-blank-outline';
    const selectionControlColor = theme.Colors.isValid(color)? color : theme.colors.primary;
  return (
    <TouchableRipple
      {...rest}
      borderless
      rippleColor={rippleColor}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ disabled, checked }}
      accessibilityLiveRegion="polite"
      style={styles.container}
      testID={testID}
      theme={theme}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <FontIcon
          allowFontScaling={false}
          name={icon}
          size={24}
          color={selectionControlColor}
          direction="ltr"
        />
        <View style={[StyleSheet.absoluteFill, styles.fillContainer]}>
          <Animated.View
            style={[
              styles.fill,
              { borderColor: selectionControlColor },
              { borderWidth },
            ]}
          />
        </View>
      </Animated.View>
    </TouchableRipple>
  );
};

CheckboxWeb.displayName = 'Checkbox.Android';

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    width: 36,
    height: 36,
    padding: 6,
  },
  fillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    height: 14,
    width: 14,
  },
});

export default CheckboxWeb;

CheckboxWeb.propTypes = {
    status: PropTypes.oneOf(['checked','unchecked','indeterminate']),
    /**
     * Whether checkbox is disabled.
     */
    disabled : PropTypes.bool,
    /**
     * Label to be displayed on the item.
     */
    label: PropTypes.string,
    /**
     * Function to execute on press.
     */
    onPress : PropTypes.func,//(e) => void;
    /**
     * Function to execute on long press.
     */
    onLongPress : PropTypes.func,//(e) => void;
    /**
     * Type of background drawabale to display the feedback (Android).
     * https://reactnative.dev/docs/pressable#rippleconfig
     */
    background: PropTypes.any,
    accessibilityLabel : PropTypes.string,
    /**
     * Custom color for unchecked checkbox.
     */
    uncheckedColor : PropTypes.string,
    /**
     * Custom color for checkbox.
     */
    color : PropTypes.string,
    /**
     * Color of the ripple effect.
     */
    rippleColor : PropTypes.string,
    /**
     * Additional styles for container View.
     */
    style : StyleProp,
    /**
     * Specifies the largest possible scale a label font can reach.
     */
    labelMaxFontSizeMultiplier : PropTypes.number,
    /**
     * Style that is passed to Label element.
     */
    labelStyle : StyleProp,
    testID : PropTypes.string,
    /**
     * Checkbox control position.
     */
    position : PropTypes.string,
  }