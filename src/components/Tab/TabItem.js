import React from 'react';
import { StyleSheet,View} from 'react-native';
import theme,{ StylePropTypes,flattenStyle,Colors} from '$theme';
import PropTypes from "prop-types";
import {defaultStr} from "$cutils";
import { TouchableRipple } from "react-native-paper";
import Icon from "$ecomponents/Icon";
import Label from "$ecomponents/Label";

const TabItemComponentNotThemed = ({
  active,
  containerStyle,
  iconContainerStyle,
  color,
  secondary,
  iconPosition = 'top',
  label,
  testID,
  children,
  icon,
  iconProps,
  index,
  rippleColor,
  activeIndex,
  labelProps,
  ...rest
}) => {
  const activeStyle = React.useCallback((type) => {
    return (typeof type === 'function' ? type(active) : type);
  },[active]);
  const style  = flattenStyle(rest.style);
  const backgroundColor = Colors.isValid(style.backgroundColor) ? style.backgroundColor : Colors.isValid(color) ? color: 'transparent';
  color = Colors.isValid(style.color)? style.color : Colors.getContrast(backgroundColor);
  rippleColor = Colors.isValid(rippleColor) ? rippleColor : Colors.setAlpha(color,0.32);
  testID = defaultStr(testID,"RN_TabItemComponent");
  iconProps = Object.assign({},iconProps);
  iconProps = {testID:testID+"_Icon",...iconProps,color,style:[iconProps.style,{color}]}
  labelProps = defaultObj(labelProps);
  icon = typeof icon =='function'? icon (iconProps) : 
    icon ? <Icon icon={icon} {...iconProps} /> : null;
  if(!React.isValidElement(icon)) {
    icon = null;
  }
  const isIconTop = iconPosition =='top'? true : false;
  return (<TouchableRipple
          role="tab"
          accessibilityState={{ selected: active }}
          accessibilityValue={
            typeof label === 'string' ? { text: label } : undefined
          }
          {...rest}
          rippleColor = {rippleColor}
          style ={[styles.button,{backgroundColor}, activeStyle(rest.style)]}
          testID = {testID}
      >
       <View testID={testID+'_ContentContainer'}>
         {isIconTop && icon ? icon : null}
          <Label upperCase {...labelProps} testID={testID+"_Label"} style={[[styles.label,{color,paddingVertical: !rest.icon ? 8 : 2,},activeStyle(labelProps.style)]]}>
              {label}
          </Label>
          {!isIconTop && icon ? icon : null}
       </View>
    </TouchableRipple>)
};
const TabItemComponent = theme.withStyles(TabItemComponentNotThemed,{
   mode : 'contained',
})
const styles = StyleSheet.create({
  button: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    padding : 5,
  },
  label: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  indicator: {
    display: 'flex',
    position: 'absolute',
    height: 2,
    bottom: 0,
  },
});

TabItemComponent.displayName = 'TabComponent.Item';
TabItemComponent.propTypes = {
  labelProps : PropTypes.shape(Label.propTypes),
    /** Allows to define if TabItemComponent is active. */
  active : PropTypes.bool,

  primary : PropTypes.bool,
  secondary : PropTypes.bool,
  label : PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  /**
   * Additional Styling for button container.
   * @type ViewStyle or (active: boolean) => ViewStyle
   */
  containerStyle : StylePropTypes,

  /**
   * Additional Styling for Icon Component container.
   * @type ViewStyle or (active: boolean) => ViewStyle
   */
  iconContainerStyle : StylePropTypes
}

export default TabItemComponent;