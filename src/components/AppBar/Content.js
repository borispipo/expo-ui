import * as React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Label from "$ecomponents/Label";
import theme,{Colors} from "$theme";
import {isIos,isWeb} from "$cplatform";
import {defaultObj,defaultStr} from "$cutils";
import { getThemeColors} from './utils';
const AppbarContent = ({
  color: titleColor,
  subtitle,
  subtitleStyle,
  onPress,
  disabled,
  style,
  titleRef,
  titleStyle,
  title,
  theme: themeOverrides,
  containerProps,
  titleProps,
  subtitleProps,
  testID,
  ...rest
}) => {
    const {color:tColor} = getThemeColors();
    const titleTextColor = Colors.isValid(titleColor) ? titleColor : tColor;
    titleProps = defaultObj(titleProps);
    subtitleProps = defaultObj(subtitleProps);
    testID = defaultStr(testID)+"_RN_AppBarContent";
    subtitle = subtitle === false ? null : subtitle;
    const subtitleColor = Colors.setAlpha(titleTextColor,0.7);
   const webStyle = isWeb() && theme.styles.webFontFamilly;
   const content = (
    <View
      style={[styles.container,{pointerEvents:"box-none"}, style]}
      testID={testID}
      {...rest}
    >
      <Label
          ref={titleRef}
          {...titleProps}
          style={[
            {
              color: titleTextColor,
              ...defaultObj(isIos()? theme.fonts?.regular: theme.fonts?.medium,theme.fonts.default),
            },
            webStyle,
            titleProps.style,
            titleStyle,
          ]}
          numberOfLines={1}
          accessible
          role={
            onPress
              ? 'none'
              : Platform.OS === 'web'
              ? ('heading')
              : 'header'
          }
          // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
          accessibilityTraits="header"
          testID={`${testID}-title-text`}
        >
          {title}
      </Label>
      {subtitle ? (
        <Label
          testID = {testID+"_Subtitle"}
          {...subtitleProps}
          style={[styles.subtitle, { color: subtitleColor },webStyle, subtitleProps.style, subtitleStyle]}
          numberOfLines={1}
        >
          {subtitle}
        </Label>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableWithoutFeedback
        testID={testID+"_Container"}
        {...containerProps}
        role={touchableRole}
        accessibilityTraits={touchableRole}
        accessibilityComponentType="button"
        onPress={onPress}
        disabled={disabled}
      >
        {content}
      </TouchableWithoutFeedback>
    );
  }
  return content;
};

AppbarContent.displayName = 'AppbarComponent.Content';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  v3DefaultContainer: {
    paddingHorizontal: 0,
  },
  v3MediumContainer: {
    paddingHorizontal: 0,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  v3LargeContainer: {
    paddingHorizontal: 0,
    paddingTop: 36,
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? 11 : 14,
  },
});

const iosTouchableRole = ['button', 'header'];
const touchableRole = Platform.select({
  ios: iosTouchableRole,
  default: iosTouchableRole[0],
});

export default AppbarContent;

AppbarContent.displayName = "AppBarContentComponent";