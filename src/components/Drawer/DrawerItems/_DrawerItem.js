import React from '$react';
import { StyleSheet,} from 'react-native';
import View from "$ecomponents/View";
import theme,{Colors,ALPHA} from "$theme";
import Icon from "$ecomponents/Icon"
import {defaultStr,defaultObj} from "$utils";
import {TouchableRipple} from 'react-native-paper';
import Divider from "$ecomponents/Divider";
import Label from "$ecomponents/Label";
import { MINIMIZED_ICON_SIZE,ICON_SIZE,getBackgroundColor } from '../utils';
import PropTypes from "prop-types";

/** 
 * update by @borisFouomene. for usage, @see : https://callstack.github.io/react-native-paper/drawer-item.html
 */
const DrawerItem = ({icon,iconProps,borderRadius,color,minimized,contentContainerProps,labelProps,contentProps,label,text,
    active,style,onPress,accessibilityLabel,isExpandable,right,divider, dividerProps,
    testID,
    left,
    title,
    children,
    ...rest}) => {
  style = StyleSheet.flatten(style) || {};
  testID = defaultStr(testID,"RN_DrawerItemComponent");
  const contentColor = active ? theme.colors.primary : Colors.isValid(color)? color : Colors.isValid(style.color)? style.color : Colors.setAlpha(theme.colors.text,ALPHA);
  const backgroundColor = getBackgroundColor(active);
  const fontWeight = active ? '400': 'normal';
  const font = theme.fonts.medium;
  contentContainerProps = defaultObj(contentContainerProps);
  contentProps = defaultObj(contentProps);
  labelProps = defaultObj(labelProps);
  iconProps = defaultObj(iconProps);
  label = defaultVal(label,text,children);
  if(!label && !icon) return null;
  const rProps = {};
  if(active){
    rProps.color = contentColor;
  }
  dividerProps = defaultObj(dividerProps);
  const iconSize = minimized ? 20 : ICON_SIZE;
  const iP = {color:contentColor,size:iconSize,marginHorizontal:5};
  left = typeof left =="function"? left(iP) : left;
  right = typeof right =='function'? right (iP) : right;
  icon = typeof icon =='function'? icon (iP) : icon;
  right = React.isValidElement(right)? right : null;
  left = React.isValidElement(left)? left : null;
  
  borderRadius = typeof borderRadius =='number'? borderRadius : 18;
  accessibilityLabel = defaultStr(accessibilityLabel);
  const lProps = {
    testID:testID+"_DrawerItemLabel",
    selectable:false,
    numberOfLines:1,
    ...labelProps,
    style : [{
        color: contentColor,
        ...font,
        fontWeight,
      },labelProps.style,rProps
    ],
  }
  label = typeof label =='function'? label(lProps) : label;
  label = React.isValidElement(label,true)? <Label testID={testID+"_Label"} {...lProps}>
    {label}
  </Label> : null;
  return (
    <View {...rest} testID={testID} style={[rest.style,{paddingVertical:0,marginVertical:0},minimized?styles.containerMinimized:null]}>
      <TouchableRipple
        borderless
        delayPressIn={0}
        onPress={onPress}
        testID = {testID+"_Ripple"}
        style={[
          styles.container,
          { backgroundColor },
          active ? {borderTopRightRadius: borderRadius,borderBottomRightRadius:borderRadius} : null,
          minimized ? styles.cMinimized : null,
          style,
          isExpandable ? {paddingVertical:3} : null
        ]}
        // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
        accessibilityTraits={active ? ['button', 'selected'] : 'button'}
        accessibilityComponentType="button"
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={accessibilityLabel}
      >
        <View  {...contentContainerProps} style={[styles.contentContainer,contentContainerProps.style]} testID={testID+"_Wrapper"}>
          <View {...contentProps} style={[styles.content,contentProps.style]} testID={testID+"_Content"}>
            {left}
            {icon ? (
              <Icon testID={testID+"_Icon"} icon={icon} {...iconProps} 
              style={[iconProps.style,styles.icon,!minimized?{
                 alignItems : 'flex-start'
              }:{alignItems:isExpandable?'flex-end':'center'}]} tooltip={minimized?defaultStr(title,label,accessibilityLabel):""} 
              position={minimized?'top':"right"} 
              size={minimized ?MINIMIZED_ICON_SIZE : ICON_SIZE} onPress={minimized?onPress:undefined} color={contentColor} />
            ) : null}
            {!minimized ? label : null}
          </View>
          {right}
        </View>
      </TouchableRipple>
      {divider ? <Divider testID={testID+"_Divider"} {...dividerProps} style={[dividerProps.style,{width:'100%',marginVertical:4}]}/> : null}
    </View>
  );
};

DrawerItem.displayName = 'DrawerItem';

const styles = StyleSheet.create({
  icon : {
      marginVertical:0,
      paddingVertical:0,
      marginHorizontal : 2,
      marginRight : 5,
  },
  containerMinimized : {
    alignItems : 'center',
    justifyContent : 'center',
  },
  container: {
    paddingVertical : 0,
    paddingLeft : 7,
    marginLeft: 0,
    marginRight : 7,
    marginVertical: 5,
  },
  cMinimized : {
    marginRight : 0,
    borderTopRightRadius : 0,
    borderBottomRightRadius : 0,
    marginLeft : 0,
    paddingLeft : 2,
    paddingRight : 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default DrawerItem;

const icTye = PropTypes.oneOfType([
   PropTypes.func,
   PropTypes.node,
   PropTypes.string,
])
DrawerItem.propTypes = {
  icon : icTye,
  active : PropTypes.bool,
  borderRadius : PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
  ]),
  divider : PropTypes.bool,
  dividerProps  : PropTypes.object,
  left : PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
  ]),
  right : PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
  ])
}