import React from '$react';
import {Platform,StyleSheet,TouchableWithoutFeedback,View} from 'react-native';
import Label from "$ecomponents/Label";
import theme,{Colors,StyleProp} from "$theme";
import PropTypes from "prop-types";
import {defaultObj,defaultStr} from "$cutils";
import {isIos,isAndroid,isWeb} from "$cplatform";

const AppbarContent = React.forwardRef(({
  color: titleColor,
  subtitle,
  subtitleProps,
  subtitleStyle,
  onPress,
  style,
  titleProps,
  titleRef,
  titleStyle,
  title,
  testID,
  containerProps,
  ...rest
},ref) => {

  const titleTextColor = titleColor ? titleColor : theme.colors.primaryText;
  titleProps = defaultObj(titleProps);
  subtitleProps = defaultObj(subtitleProps);
  testID = defaultStr(testID,"RN_AppBarContentComponent")
  subtitle = subtitle === false ? null : subtitle;
  const subtitleColor = Colors.setAlpha(titleTextColor,0.7);

  return (
    <TouchableWithoutFeedback testID={testID+"_Container"} {...defaultObj(containerProps)} onPress={onPress} disabled={!onPress}>
      <View
        pointerEvents="box-none"
        style={[styles.container, style]}
        {...rest}
        testID = {testID}
        ref = {ref}
      >
        <Label
          ref={titleRef}
          testID = {testID+"_Title"}
          {...titleProps}
          style={[
            {
              color: titleTextColor,
              ...(isIos()? theme.fonts.regular: theme.fonts.medium),
            },
            isWeb() && theme.styles.webFontFamilly,
            titleProps.style,
            titleStyle,
          ]}
          numberOfLines={1}
          accessible
          // @ts-ignore Type '"heading"' is not assignable to type ...
          accessibilityRole={Platform.OS === 'web' ? 'heading' : 'header'}
        >
          {title}
        </Label>
        {subtitle ? (
          <Label
            testID = {testID+"_Subtitle"}
            {...subtitleProps}
            style={[styles.subtitle, { color: subtitleColor }, subtitleProps.style, subtitleStyle]}
            numberOfLines={1}
          >
            {subtitle}
          </Label>
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
});

AppbarContent.displayName = 'Appbar.Content';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    justifyContent : 'center',
    alignItems : 'flex-start',
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? 11 : 14,
  },
});

export default AppbarContent;
const titleType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.bool,
])

AppbarContent.propTypes = {
    /**
   * Custom StyleProp for the text.
   */
  StyleProp: PropTypes.string,
  /**
   * Text for the title.
   */
  title: titleType,
  /**
   * Style for the title.
   */
  titleStyle: StyleProp,
  /**
   * Reference for the title.
   */
  titleRef : PropTypes.any,
  /**
   * @deprecated Deprecated in v5.x
   * Text for the subtitle.
   */
  subtitle : titleType,
  /**
   * @deprecated Deprecated in v5.x
   * Style for the subtitle.
   */
  subtitleStyle: StyleProp,
  /**
   * Function to execute on press.
   */
  onPress : PropTypes.func,
  style : StyleProp
}