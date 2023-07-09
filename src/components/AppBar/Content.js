import * as React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Label from "$comonents/Label";
import theme,{Colors} from "$theme";
import {isIos,isWeb} from "$cplatform";
import {defaultObj,defaultStr} from "$cutils";
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
  ...rest
}) => {
  
    const titleTextColor = Colors.isValid(titleColor) ? titleColor : theme.colors.primaryText;
    titleProps = defaultObj(titleProps);
    subtitleProps = defaultObj(subtitleProps);
    testID = defaultStr(testID,"RN_AppBarContentComponent")
    subtitle = subtitle === false ? null : subtitle;
    const subtitleColor = Colors.setAlpha(titleTextColor,0.7);

   const content = (
    <View
      pointerEvents="box-none"
      style={[styles.container, style]}
      testID={testID}
      {...rest}
    >
      {typeof title === 'string' ? (
        <Label
          ref={titleRef}
          {...titleProps}
          style={[
            styles.title,
            {
                color: titleTextColor,
                ...(isIos()? theme.fonts.regular: theme.fonts.medium),
            },
            isWeb() && theme.styles.webFontFamilly,
            titleStyle,
          ]}
          numberOfLines={1}
          accessible
          accessibilityRole={
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
      ) : (
        title
      )}
      {subtitle ? (
        <Label
          testID = {testID+"_Subtitle"}
          {...subtitleProps}
          style={[styles.subtitle, { color: subtitleColor }, subtitleStyle]}
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
        accessibilityRole={touchableRole}
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