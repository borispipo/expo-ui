import * as React from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from "prop-types";

import {ActivityIndicator,Text,TouchableRipple,Surface} from "react-native-paper";
import { getExtendedFabStyle, getFABColors, getFabStyle } from '../utils';
import Icon from "$ecomponents/Icon";
import theme,{StyleProp} from "$theme";

const FAB = React.forwardRef(
  (
    {
      icon,
      label,
      background,
      accessibilityLabel = label,
      accessibilityState,
      animated = true,
      color: customColor,
      rippleColor: customRippleColor,
      disabled,
      onPress,
      onLongPress,
      delayLongPress,
      theme: themeOverrides,
      style,
      visible = true,
      uppercase: uppercaseProp,
      loading,
      testID = 'fab',
      size = 'medium',
      customSize,
      mode = 'elevated',
      variant = 'primary',
      labelMaxFontSizeMultiplier,
      ...rest
    },ref
  ) => {
    const uppercase = uppercaseProp ?? !theme.isV3;
    const { current: visibility } = React.useRef<Animated.Value>(
      new Animated.Value(visible ? 1 : 0)
    );
    const { isV3, animation } = theme;
    const { scale } = animation;

    React.useEffect(() => {
      if (visible) {
        Animated.timing(visibility, {
          toValue: 1,
          duration: 200 * scale,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(visibility, {
          toValue: 0,
          duration: 150 * scale,
          useNativeDriver: true,
        }).start();
      }
    }, [visible, scale, visibility]);

    const fabStyle = getFabStyle({ customSize, size, theme });

    const {
      borderRadius = fabStyle.borderRadius,
      backgroundColor: customBackgroundColor,
    } = (StyleSheet.flatten(style) || {});

    const { backgroundColor, foregroundColor, rippleColor } = getFABColors({
      theme,
      variant,
      disabled,
      customColor,
      customBackgroundColor,
      customRippleColor,
    });

    const isLargeSize = size === 'large';
    const isFlatMode = mode === 'flat';
    const iconSize = isLargeSize ? 36 : 24;
    const loadingIndicatorSize = isLargeSize ? 24 : 18;
    const font = isV3 ? theme.fonts.labelLarge : theme.fonts.medium;

    const extendedStyle = getExtendedFabStyle({ customSize, theme });
    const textStyle = {
      color: foregroundColor,
      ...font,
    };

    const md3Elevation = isFlatMode || disabled ? 0 : 3;

    const newAccessibilityState = { ...accessibilityState, disabled };

    return (
      <Surface
        ref={ref}
        {...rest}
        style={[
          {
            borderRadius,
            backgroundColor,
            opacity: visibility,
            transform: [
              {
                scale: visibility,
              },
            ],
          },
          !isV3 && styles.elevated,
          !isV3 && disabled && styles.disabled,
          style,
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
        testID={`${testID}-container`}
        {...(isV3 && { elevation: md3Elevation })}
      >
        <TouchableRipple
          borderless
          background={background}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={delayLongPress}
          rippleColor={rippleColor}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={newAccessibilityState}
          testID={testID}
          style={{ borderRadius }}
          {...rest}
        >
          <View
            style={[styles.content, label ? extendedStyle : fabStyle]}
            testID={`${testID}-content`}
            pointerEvents="none"
          >
            {icon && loading !== true ? (
              <Icon
                icon={icon}
                size={customSize ? customSize / 2 : iconSize}
                color={foregroundColor}
              />
            ) : null}
            {loading ? (
              <ActivityIndicator
                size={customSize ? customSize / 2 : loadingIndicatorSize}
                color={foregroundColor}
              />
            ) : null}
            {label ? (
              <Text
                variant="labelLarge"
                selectable={false}
                testID={`${testID}-text`}
                style={[
                  styles.label,
                  uppercase && styles.uppercaseLabel,
                  textStyle,
                ]}
                maxFontSizeMultiplier={labelMaxFontSizeMultiplier}
              >
                {label}
              </Text>
            ) : null}
          </View>
        </TouchableRipple>
      </Surface>
    );
  }
);

const styles = StyleSheet.create({
  elevated: {
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginHorizontal: 8,
  },
  uppercaseLabel: {
    textTransform: 'uppercase',
  },
  disabled: {
    elevation: 0,
  },
});

FAB.propTypes = {
    // For `icon` and `label` props their types are duplicated due to the generation of documentation.
    // Appropriate type for them is `IconOrLabel` contains the both union and intersection types.
    /**
     * Icon to display for the `FAB`. It's optional only if `label` is defined.
     */
    icon : PropTypes.shape({...Object.assign({},Icon.propTypes)}),
    /**
     * Optional label for extended `FAB`. It's optional only if `icon` is defined.
     */
    label : PropTypes.node,
    /**
     * Make the label text uppercased.
     */
    uppercase : PropTypes.bool,
    /**
     * Type of background drawabale to display the feedback (Android).
     * https://reactnative.dev/docs/pressable#rippleconfig
     */
    background : PropTypes.any,
    /**
     * Accessibility label for the FAB. This is read by the screen reader when the user taps the FAB.
     * Uses `label` by default if specified.
     */
    accessibilityLabel : PropTypes.string,
    /**
     * Whether an icon change is animated.
     */
    animated : PropTypes.bool,
    /**
     *  @deprecated Deprecated in v.5x - use prop size="small".
     *
     *  Whether FAB is mini-sized, used to create visual continuity with other elements. This has no effect if `label` is specified.
     */
    small : PropTypes.bool,
    /**
     * Custom color for the icon and label of the `FAB`.
     */
    color : PropTypes.string,
    /**
     * Color of the ripple effect.
     */
    rippleColor : PropTypes.string,
    /**
     * Whether `FAB` is disabled. A disabled button is greyed out and `onPress` is not called on touch.
     */
    disabled: PropTypes.bool,
    /**
     * Whether `FAB` is currently visible.
     */
    visible: PropTypes.bool,
    /**
     * Whether to show a loading indicator.
     */
    loading: PropTypes.bool,
    /**
     * Function to execute on press.
     */
    onPress: PropTypes.func,
    /**
     * Function to execute on long press.
     */
    onLongPress: PropTypes.func,
    /**
     * The number of milliseconds a user must touch the element before executing `onLongPress`.
     */
    delayLongPress : PropTypes.number,
    /**
     * @supported Available in v5.x with theme version 3
     *
     * Size of the `FAB`.
     * - `small` - FAB with small height (40).
     * - `medium` - FAB with default medium height (56).
     * - `large` - FAB with large height (96).
     */
    size : PropTypes.oneOf([`small`,`medium`,`large`]),
    /**
     * Custom size for the `FAB`. This prop takes precedence over size prop
     */
    customSize : PropTypes.number,
    /**
     * @supported Available in v5.x with theme version 3
     *
     * Mode of the `FAB`. You can change the mode to adjust the the shadow:
     * - `flat` - button without a shadow.
     * - `elevated` - button with a shadow.
     */
    mode : PropTypes.oneOf([`flat`,`elevated`]),
    /**
     * @supported Available in v5.x with theme version 3
     *
     * Color mappings variant for combinations of container and icon colors.
     */
    variant : PropTypes.oneOf(['primary' , 'secondary' , 'tertiary' , 'surface']),
    /**
     * Specifies the largest possible scale a label font can reach.
     */
    labelMaxFontSizeMultiplier : PropTypes.number,
    style : StyleProp,
    /**
     * TestID used for testing purposes
     */
    testID: PropTypes.string,
  }

export default FAB;

// @component-docs ignore-next-line
export { FAB };