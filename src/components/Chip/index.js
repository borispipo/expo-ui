import React from '$react';
import View from "$ecomponents/View";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from "$ecomponents/Icon";
import {Text,TouchableRipple } from 'react-native-paper';
import theme,{ black,Colors, white,StyleProps} from '$theme';
import PropTypes from "prop-types";
import {flatMode } from '$ecomponents/TextField/utils';
import {defaultStr} from "$utils";
import Surface from "$ecomponents/Surface";

const ChipComponent = React.forwardRef(({
  mode = flatMode,
  children,
  icon,
  avatar,
  selected = false,
  disabled = false,
  accessibilityLabel,
  closeIconAccessibilityLabel = 'Close',
  onPress,
  onLongPress,
  onClose,
  closeIcon,
  textStyle,
  style,
  testID,
  selectedColor,
  ellipsizeMode,
  ...rest
},ref) => {
  testID =defaultStr(testID,"RN_ChipComponent");
  const { current: elevation } = React.useRef(
    new Animated.Value(0)
  );

  const handlePressIn = () => {
    const { scale } = theme.animation;
    Animated.timing(elevation, {
      toValue: 4,
      duration: 200 * scale,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    const { scale } = theme.animation;
    Animated.timing(elevation, {
      toValue: 0,
      duration: 150 * scale,
      useNativeDriver: true,
    }).start();
  };

  const dark = theme.isDark();
  const defaultBackgroundColor =
    mode === 'outlined' ? theme.colors.surface : dark ? '#383838' : '#ebebeb';
  style = Object.assign({},StyleSheet.flatten(style));
  const { backgroundColor = defaultBackgroundColor, borderRadius = 16,color:customColor} = style;

  const borderColor =
    mode === 'outlined'? (selectedColor !== undefined ? selectedColor : Colors.setAlpha(dark ? white : black,0.29)) : backgroundColor;
  const textColor = Colors.isValid(customColor)?customColor 
    : Colors.setAlpha(selectedColor !== undefined ? selectedColor : colors.text,0.87);
  const iconColor =  Colors.setAlpha(textColor,theme.ALPHA);
        
  const backgroundColorString = typeof backgroundColor === 'string' ? backgroundColor : defaultBackgroundColor;
  const selectedBackgroundColor = ( dark ? Colors.lighten(backgroundColorString,mode === 'outlined' ? 0.2 : 0.4)
      : Colors.darken(backgroundColorString,mode === 'outlined' ? 0.08 : 0.2)
  )

  const underlayColor = selectedColor ? Colors.setAlpha(selectedColor,theme.ALPHA) : selectedBackgroundColor;

  const accessibilityTraits = ['button'];
  const accessibilityState = {
    selected,
    disabled,
  };

  if (selected) {
    accessibilityTraits.push('selected');
  }

  if (disabled) {
    accessibilityTraits.push('disabled');
  }
  const onChipClose = (e)=>{
    React.stopEventPropagation(e);
    if(onClose){
      onClose(e);
    }
  }
  return (
    <Surface
      ref = {ref}
      elevation= {typeof elevation =='number'? elevation : 0}
      style={
        [
          styles.container,
          {
            backgroundColor: selected
              ? selectedBackgroundColor
              : backgroundColor,
            borderColor,
            borderRadius,
          },
          style,
        ]
      }
      {...rest}
      testID = {testID}
    >
      <TouchableRipple
        borderless
        delayPressIn={0}
        style={[{ borderRadius }, styles.touchable]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        underlayColor={underlayColor}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
        accessibilityTraits={accessibilityTraits}
        accessibilityComponentType="button"
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        testID={testID+"_Container"}
      >
        <View testID={testID+"_ContentContainer"} style={[styles.content, { paddingRight: onClose ? 32 : 4 }]}>
          {avatar && !icon ? (
            <View testID={testID+"_AvatarContainer"} style={[styles.avatarWrapper, disabled && { opacity: 0.26 }]}>
              {React.isValidElement(avatar)
                ? React.cloneElement(avatar, {
                    style: [styles.avatar, avatar.props.style],
                  })
                : avatar}
            </View>
          ) : null}
          {icon || selected ? (
            <View
              style={[
                styles.icon,
                avatar ? [styles.avatar, styles.avatarSelected] : null,
              ]}
              testID={testID+"_IconContainer"}
            >
              {icon ? (
                <Icon
                  source={icon}
                  color={avatar ? white : iconColor}
                  size={18}
                  testID={testID+"_CloseIcon"}
                />
              ) : (
                <Icon
                  name="check"
                  color={avatar ? white : iconColor}
                  size={18}
                  testID={testID+"_Icon"}
                  direction="ltr"
                />
              )}
            </View>
          ) : null}
          <Text
            selectable={false}
            numberOfLines={1}
            testID={testID+"_Text"}
            style={[
              styles.text,
              {
                ...theme.fonts.regular,
                color: textColor,
                marginHorizontal : 4,
                marginLeft: avatar || icon || selected ? 4 : 8,
              },
              textStyle,
            ]}
            ellipsizeMode={ellipsizeMode}
          >
            {children}
          </Text>
        </View>
      </TouchableRipple>
      {onClose ? (
        <View style={styles.closeButtonStyle} testID={testID+"_CloseButtonContainer"}>
          <TouchableWithoutFeedback
            onPress={onPress}
            // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
            accessibilityLabel={closeIconAccessibilityLabel}
            testID={testID+"_CloseButtonRipple"}
          >
            <View testID={testID+"_ContentContainer"} style={[styles.icon, styles.closeIcon]}>
              {closeIcon ? (
                <Icon testID={testID+"_CloseButtonCloseIcon"} source={closeIcon} onPress = {onChipClose} color={iconColor} size={16} />
              ) : (
                <Icon
                  name="close-circle"
                  size={16}
                  color={iconColor}
                  onPress = {onChipClose}
                  testID={testID+"_CloseButtonChip"}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      ) : null}
    </Surface>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    flexDirection: Platform.select({ default: 'column', web: 'row' }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    position: 'relative',
    flexGrow: 1,
  },
  icon: {
    padding: 4,
    alignSelf: 'center',
  },
  closeIcon: {
    marginRight: 4,
  },
  text: {
    minHeight: 24,
    lineHeight: 24,
    textAlignVertical: 'center',
    marginVertical: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarWrapper: {
    marginRight: 4,
  },
  avatarSelected: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, .29)',
  },
  closeButtonStyle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    flexGrow: 1,
  },
});

export default ChipComponent;

ChipComponent.propTypes = {
    /**
     * Mode of the chip.
     * - `flat` - flat chip without outline.
     * - `outlined` - chip with an outline.
     */
    mode : PropTypes.oneOf(['flat','outlined']),
    /**
     * Text content of the `Chip`.
     */
    children: PropTypes.node,
    /**
     * Icon to display for the `Chip`. Both icon and avatar cannot be specified.
     */
    icon: PropTypes.shape({...Icon.propTypes}),
    /**
     * Avatar to display for the `Chip`. Both icon and avatar cannot be specified.
     */
    avatar: PropTypes.node,
    /**
     * Icon to display as the close button for the `Chip`. The icon appears only when the onClose prop is specified.
     */
    closeIcon: PropTypes.shape({...Icon.propTypes}),
    /**
     * Whether chip is selected.
     */
    selected: PropTypes.bool,
    /**
     * Whether to style the chip color as selected.
     */
    selectedColor: PropTypes.string,
    /**
     * Whether the chip is disabled. A disabled chip is greyed out and `onPress` is not called on touch.
     */
    disabled: PropTypes.bool,
    /**
     * Accessibility label for the chip. This is read by the screen reader when the user taps the chip.
     */
    accessibilityLabel: PropTypes.string,
    /**
     * Accessibility label for the close icon. This is read by the screen reader when the user taps the close icon.
     */
    closeIconAccessibilityLabel: PropTypes.string,
    /**
     * Function to execute on press.
     */
    onPress: PropTypes.func,
    /**
     * Function to execute on long press.
     */
    onLongPress: PropTypes.func,
    /**
     * Function to execute on close button press. The close button appears only when this prop is specified.
     */
    onClose: PropTypes.func,
    /**
     * Style of chip's text
     */
    textStyle: StyleProps,
    style: StyleProps,
  
    /**
     * @optional
     */
    theme: PropTypes.object,
    /**
     * Pass down testID from chip props to touchable for Detox tests.
     */
    testID: PropTypes.string,
    /**
     * Ellipsize Mode for the children text
     */
    ellipsizeMode: PropTypes.object,
  };