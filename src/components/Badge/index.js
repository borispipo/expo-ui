import React from 'react';
import {
  StyleSheet,
  Pressable,
} from 'react-native';
import View from "$ecomponents/View";
import theme,{ StyleProps,Colors} from '$theme';
import PropTypes from "prop-types";
import {defaultVal,defaultNumber,defaultObj} from "$cutils";
import Label from "$ecomponents/Label";

const defaultSize = 18;
const miniSize = 8;


export const BadgeComponent = ({
  containerStyle,
  labelStyle,
  labelProps,
  badgeStyle,
  onPress,
  onLongPress,
  onPressOut,
  onPressIn,
  containerProps,
  style,
  suffix,
  useSuffix,
  color,
  Component = onPress || onLongPress || onPressIn || onPressOut
    ? Pressable
    : View,
  size,
  children,
  status = 'primary',
  pressableProps,
  ...rest
}) => {
  size = defaultNumber(size,defaultSize);
  labelProps = Object.assign({},labelProps);
  labelProps.style = [styles.text,labelStyle,labelProps.style];
  containerProps = defaultObj(containerProps);
  style = StyleSheet.flatten([
    {
      alignSelf: 'center',
      minWidth: size,
      height: size,
      suffix,
      color,
      useSuffix,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors[status],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#fff',
    },
    badgeStyle && badgeStyle,
    style,
  ])
  const hasColor = Colors.isValid(color);
  color = hasColor? color : Colors.isValid(style.color) ? style.color : undefined;
  if((!color || useSuffix) && isNumber(suffix)){
      style = [style,{...cProps,...Colors.getAvatarStyleFromSuffix(suffix)}];
      labelProps.style = [labelStyle.style,{color:style.color}];
  } else if(hasColor){
      style.backgroundColor = color;
      style.color = Colors.getContrast(color);
      labelProps.style = [labelProps.style,{color:style.color}]
  }
  return (
    <View
      testID="RN__BadgeComponent__Container"
      {...containerProps}
      style={([containerProps.style,containerStyle])}
    >
      <Component
        {...{
          onPress,
          onLongPress,
          onPressOut,
          onPressIn,
          ...pressableProps,
          ...rest,
        }}
        testID="RN__BadgeComponent"
        style={style}
      >
        <Label {...labelProps}>{children}</Label>
      </Component>
    </View>
  );
};

const styles = StyleSheet.create({
  miniBadgeComponent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    minWidth: miniSize,
    height: miniSize,
    borderRadius: miniSize / 2,
  },
  text: {
    fontSize: 12,
    color: 'white',
    paddingHorizontal: 4,
  },
});

BadgeComponent.displayName = 'BadgeComponent';

BadgeComponent.propTypes = {
    /** Style for the container. */
  containerStyle: StyleProps,

  /** Additional styling for badge (background) view component. */
  badgeStyle: StyleProps,

  /** Extra props for text component. */
  labelProps : PropTypes.object,

  /** Extra styling for icon component. */
  labelStyle : StyleProps,
  children : PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
      PropTypes.number,
  ]),

  /** Custom component to replace the badge outer component.
   *  @default `Press handlers present then Pressable else View`
   */
  Component : PropTypes.element,

  /** Determines color of the indicator. */
  status : PropTypes.string,
  color : PropTypes.string,
  useSuffix : PropTypes.bool,
}

  export default BadgeComponent;