import color from 'color';
import * as React from 'react';
import {
  StyleSheet,
} from 'react-native';
import {TouchableRipple} from "react-native-paper";
import Icon from "$ecomponents/Icon";
import theme,{black,white,Colors,StylePropTypes,DISABLED_OPACITY} from "$theme";
import PropTypes from "prop-types";
import { Dimensions } from 'react-native';
import View from "$ecomponents/View";
import {defaultVal,isNonNullString,defaultStr,defaultObj} from "$utils";
import Tooltip from "$ecomponents/Tooltip";
import Label from "$ecomponents/Label";

const minWidth = 112;
const maxWidth = 280;
const iconWidth = 40;

const MenuItemComponent = React.forwardRef(({
  icon,
  title,
  label,
  text,
  disabled,
  onPress,
  style,
  textBold,
  bold,
  contentStyle,
  testID,
  labelStyle,
  primary,
  secondary,
  iconProps,
  isBottomSheetItem,
  accessibilityLabel,
  right,
  labelProps,
  contentContainerProps,
  ...rest
},ref) => {
  labelProps = defaultObj(labelProps);
  contentContainerProps = defaultObj(contentContainerProps);
  title = defaultVal(label,text,title);
  const disabledColor = color(theme.dark ? white : black)
    .alpha(0.32)
    .rgb()
    .string();

  let titleColor = primary === true ? theme.colors.primaryOnSurface: secondary === true ? theme.colors.secondaryOnSurface : disabled
    ? disabledColor
    : color(theme.colors.text).alpha(0.87).rgb().string();

  let iconColor = primary === true ? theme.colors.primaryOnSurface : secondary === true ? theme.colors.secondaryOnSurface : disabled
    ? disabledColor
    : color(theme.colors.text).alpha(theme.ALPHA).rgb().string();
  iconProps = defaultObj(iconProps);
  labelStyle = Object.assign({},StyleSheet.flatten([labelProps.style,labelStyle]));
  if(textBold || bold){
    labelStyle.fontWeight = "bold";
  }
  style = Object.assign({},StyleSheet.flatten(style));

  if(Colors.isValid(labelStyle.color)){
     iconColor = labelStyle.color;
  } else if(Colors.isValid(style.color)){
    titleColor = iconColor = style.color;
  }
  const pointerEvents = disabled ? 'none' : 'auto';
  const disabledStyle = disabled ? {opacity:DISABLED_OPACITY} : null;
  const winW = Dimensions.get("window").width-30;
  const maxWidthStyle = isBottomSheetItem ? {maxWidth:winW,paddingRight:10} : undefined;
  const maxWidthTextStyle = isBottomSheetItem ? {width:winW-50} : null;
  right = typeof right =='function'? right ({color:titleColor}) : right;
  if(!React.isValidElement(right)) right = null;
  return (
    <Tooltip
      {...defaultObj(rest)}
      tooltip = {defaultVal(rest.tooltip,title,label,text)}
      Component = {TouchableRipple}
      style={[styles.container, style,maxWidthStyle,disabledStyle]}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      pointerEvents = {pointerEvents}
    >
      <View style={[styles.row]} ref={ref} testID={testID+"_ContentContainer"}>
        {icon ? (
          <View testID={testID+"_IconContainer"} style={[styles.item, styles.icon]} pointerEvents="box-none">
            <Icon source={icon} size={24} {...iconProps} style={[iconProps.style,styles.iconT]} color={iconColor} />
          </View>
        ) : null}
        <View
          testID={testID+"_Right2LabelContainer"}
          pointerEvents={!right?"none":"auto"}
          {...contentContainerProps}
          style={[
            styles.item,
            styles.content,
            !maxWidthStyle && icon ? styles.widthWithIcon : null,
            contentStyle,
            !icon?styles.titleNoIcon:null,
            right && theme.styles.row,
            maxWidthStyle,
            contentContainerProps.style
          ]}
        >
          <Label
            testID={testID+"_Label"}
            selectable={false}
            numberOfLines={1}
            splitText
            {...labelProps}
            style={[styles.title, { color: titleColor }, labelStyle,styles.noMargin,!right ? maxWidthTextStyle : null]}
          >
            {title}
          </Label>
          {right}
        </View>
      </View>
    </Tooltip>
  );
});

MenuItemComponent.displayName = 'Menu.Item';


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    minWidth,
    maxWidth,
    height: 48,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent : 'flex-start',
    alignItems : 'center'
  },
  icon: {
    width: iconWidth,
    marginHorizontal : 0,
    paddingHorizontal : 0,
    marginLeft:0,
    alignSelf : 'flex-start'
  },
  noMargin : {
    marginLeft:0,
    marginHorizontal:0,
    paddingHorizontal:0,
  },
  title: {
    fontSize: 16,
  },
  iconT : {
    alignSelf : 'flex-end'
  },
  item: {
    marginHorizontal: 0,
  },
  content: {
    justifyContent: 'center',
    minWidth: minWidth - 16,
    maxWidth: maxWidth - 16,
  },
  widthWithIcon: {
    maxWidth: maxWidth - iconWidth /*+ 48*/,
  },
  widthWithRight: {
    maxWidth: maxWidth - iconWidth /*+ 48*/,
  },
  titleNoIcon : {
    marginHorizontal : 8
  }
});

MenuItemComponent.propTypes = {
    primary : PropTypes.bool,
    secondary : PropTypes.bool,
    /**
     * Title text for the `MenuItemComponent`.
     */
    title: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ]),
    /**
     * Icon to display for the `MenuItemComponent`.
     */
    icon : PropTypes.any,
    /**
     * Whether the 'item' is disabled. A disabled 'item' is greyed out and `onPress` is not called on touch.
     */
    disabled : PropTypes.bool,
    /**
     * Function to execute on press.
     */
    onPress : PropTypes.func,
    /**
     * @optional
     */
    style: StylePropTypes,
    contentStyle: StylePropTypes,
    labelStyle : StylePropTypes,
    /**
     * @optional
     */
    theme: PropTypes.object,
    /**
     * TestID used for testing purposes
     */
    testID : PropTypes.string,
    /**
     * Accessibility label for the Touchable. This is read by the screen reader when the user taps the component.
     */
    accessibilityLabel : PropTypes.string,
  };


export default MenuItemComponent;