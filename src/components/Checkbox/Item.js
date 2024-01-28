import * as React from 'react';
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
} from 'react-native';
import { StyleProp } from '$theme';
import theme from "$theme";
import Checkbox from './Checkbox';
import { TouchableRipple,Text } from 'react-native-paper';

const CheckboxItem = ({
  style,
  status,
  label,
  onPress,
  onLongPress,
  labelStyle,
  theme: themeOverrides,
  testID,
  mode,
  position = 'trailing',
  accessibilityLabel = label,
  disabled,
  labelVariant = 'bodyLarge',
  labelMaxFontSizeMultiplier = 1.5,
  rippleColor,
  background,
  ...props
}) => {
  const checkboxProps = { ...props, status, theme, disabled };
  const isLeading = position === 'leading';
  const checkbox = <Checkbox {...checkboxProps} />

  const textColor = theme.isV3 ? theme.colors.onSurface : theme.colors.text;
  const disabledTextColor = theme.isV3
    ? theme.colors.onSurfaceDisabled
    : theme.colors.disabled;
  const textAlign = isLeading ? 'right' : 'left';

  const computedStyle = {
    color: disabled ? disabledTextColor : textColor,
    textAlign,
  }

  return (
    <TouchableRipple
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: status === 'checked',
        disabled,
      }}
      onPress={onPress}
      onLongPress={onLongPress}
      testID={testID}
      disabled={disabled}
      rippleColor={rippleColor}
      theme={theme}
      background={background}
    >
      <View
        style={[styles.container, style]}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
      >
        {isLeading && checkbox}
        <Text
          variant={labelVariant}
          testID={`${testID}-text`}
          maxFontSizeMultiplier={labelMaxFontSizeMultiplier}
          style={[
            styles.label,
            !theme.isV3 && styles.font,
            computedStyle,
            labelStyle,
          ]}
        >
          {label}
        </Text>
        {!isLeading && checkbox}
      </View>
    </TouchableRipple>
  );
};

CheckboxItem.displayName = 'Checkbox.Item';

export default CheckboxItem;

// @component-docs ignore-next-line
export { CheckboxItem };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  label: {
    flexShrink: 1,
    flexGrow: 1,
  },
  font: {
    fontSize: 16,
  },
});
CheckboxItem.propTypes = {
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
  /**
   * Whether `<Checkbox.Android />` or `<Checkbox.IOS />` should be used.
   * Left undefined `<Checkbox />` will be used.
   */
  mode : PropTypes.oneOf(['android','ios'])
}