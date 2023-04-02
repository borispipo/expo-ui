import * as React from 'react';
import {
  StyleSheet,
} from 'react-native';
import {TouchableRipple} from "react-native-paper";
import CrossFadeIcon from 'react-native-paper/lib/commonjs/components/CrossFadeIcon';
import Surface from '$ecomponents/Surface';
import { IconButton } from 'react-native-paper';
import PropTypes from "prop-types";
import theme,{StyleProp,Colors} from "$theme";
import {defaultStr} from "$cutils";

const IconButtonComponent = ({
  icon,
  iconColor: customIconColor,
  containerColor,
  size = 24,
  accessibilityLabel,
  disabled,
  onPress,
  selected = false,
  animated = false,
  mode,
  containerProps,
  style,
  testID,
  color,
  ...rest
}) => {
  const IconComponent = animated ? CrossFadeIcon : IconButton;
  testID = defaultStr(testID,"RN_IconButtonComponent");
  containerProps = defaultObj(containerProps);
  const containerStyle = StyleSheet.flatten(containerProps.style) || {};
  const backgroundColor = Colors.isValid(containerColor)? containerColor : Colors.isValid(containerStyle.color) ? containerStyle.color : undefined;
  const iconColor = Colors.isValid(customIconColor)? customIconColor : Colors.isValid(color)? color : theme.colors.text;
  const borderColor = theme.colors.outline || theme.colors.divider;
  const rippleColor = Colors.setAlpha(iconColor,0.32);
  const buttonSize =  size * 1.5;
  const borderStyles = {
    borderWidth: 0,
    borderRadius: buttonSize / 2,
    borderColor,
  };

  return (
    <Surface
      testID = {testID+"_Container"}
      style={
        [
          {
            backgroundColor,
            width: buttonSize,
            height: buttonSize,
          },
          styles.container,
          borderStyles,
          disabled && styles.disabled,
          style,
        ]
      }
    >
      <TouchableRipple
        borderless
        centered
        onPress={onPress}
        rippleColor={rippleColor}
        accessibilityLabel={accessibilityLabel}
        style={styles.touchable}
        // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
        accessibilityTraits={disabled ? ['button', 'disabled'] : 'button'}
        accessibilityComponentType="button"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={
          TouchableRipple.supported
            ? { top: 10, left: 10, bottom: 10, right: 10 }
            : { top: 6, left: 6, bottom: 6, right: 6 }
        }
        {...rest}
        testID = {testID}
      >
        <IconComponent testID={testID+"_Icon"} color={iconColor} source={icon} size={size} />
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    margin: 6,
    elevation: 0,
  },
  touchable: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.32,
  },
});

IconButtonComponent.propTypes = {
    /**
   * Icon to display.
   */
  icon: PropTypes.oneOfType(PropTypes.string,PropTypes.object),
  /**
   * @supported Available in v5.x
   * Mode of the icon button. By default there is no specified mode - only pressable icon will be rendered.
   */
  mode : PropTypes.oneOf([
    'outlined','contained' ,'contained-tonal'
  ]),
  /**
   * @renamed Renamed from 'color' to 'iconColor' in v5.x
   * Color of the icon.
   */
  iconColor: PropTypes.string,
  /**
   * @supported Available in v5.x
   * Background color of the icon container.
   */
  containerColor: PropTypes.string,
  /**
   * @supported Available in v5.x
   * Whether icon button is selected. A selected button receives alternative combination of icon and container colors.
   */
  selected: PropTypes.bool,
  /**
   * Size of the icon.
   */
  size : PropTypes.number,
  /**
   * Whether the button is disabled. A disabled button is greyed out and `onPress` is not called on touch.
   */
  disabled: PropTypes.bool,
  /**
   * Whether an icon change is animated.
   */
  animated: PropTypes.bool,
  /**
   * Accessibility label for the button. This is read by the screen reader when the user taps the button.
   */
  accessibilityLabel: PropTypes.string,
  /**
   * Function to execute on press.
   */
  onPress : PropTypes.func,//(e: GestureResponderEvent) => void;
  style : StyleProp,
  ref : PropTypes.object,
}
export default theme.withStyles(IconButtonComponent,{displayName:"IconButtonComponent"});