import React from '$react';
import {Text,StyleSheet,Pressable} from 'react-native';
import View from "$ecomponents/View";
import PropTypes from 'prop-types';
import {Colors,StylePropTypes} from "$theme";
import {defaultStr,defaultNumber} from "$utils";

const defaultSize = 64;

const AvatarTextComponent = (props) => {
  const {
    label : customLabel,
    size : customSize,
    containerProps : customContainerProps,
    color : customColor,
    labelStyle,
    children,
    style : customStyle,
    onPress:customOnPress,
    testID : customTestID,
  } = props;
  const containerProps = defaultObj(customContainerProps);
  const size = defaultNumber(customSize,defaultSize);
  const testID = defaultStr(customTestID,"RN_AvatarComponent.Text");
  const style = Object.assign({},StyleSheet.flatten(customStyle));
  let label = defaultStr(customLabel,children);
  if(!label) return null;
  label = label.trim();
  const color = Colors.isValid(customColor)? customColor : Colors.isValid(style.color)? style.color : undefined;
  const words = label.split(" ");
  let l = "";
  for(let i in words){
    if(l.length == 2) break;
    if(words[i]){
       words[i] = words[i].trim()
       if(words[i][0]){
         l+= words[i][0].toUpperCase();
       }
    }
  }
  const textContainerStyle = {
    marginTop: -(size / 20),
    height: size,
    width: size,
  };
  const onPress = typeof customOnPress =='function' ? customOnPress : undefined;
  const C = onPress? Pressable : View;
  return (
    <C testID={testID+"_Container"} pointerEvents={onPress?"auto":'none'} {...containerProps} style={[styles.container,style,containerProps.style,textContainerStyle,{borderRadius:size/2}]}>
      { <Text
        testID={testID}
        style={[{
          color: color,
          fontSize: size / 2.5,
        }, labelStyle]}
        adjustsFontSizeToFit={true}
      >
        {l}
      </Text>}
    </C>
  );
};

AvatarTextComponent.propTypes = {
  label: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  labelStyle: StylePropTypes,
  style: StylePropTypes,
};

const styles = StyleSheet.create({
    container : {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default AvatarTextComponent;