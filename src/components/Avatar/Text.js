import React from '$react';
import {Text,StyleSheet} from 'react-native';
import View from "$components/View";
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
  } = props;
  const containerProps = defaultObj(customContainerProps);
  const size = defaultNumber(customSize,defaultSize);
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
  return (
    <View  pointerEvents='none' {...containerProps} style={[styles.container,style,containerProps.style,textContainerStyle,{borderRadius:size/2}]}>
      { <Text
        style={[{
          color: color,
          fontSize: size / 2.5,
        }, labelStyle]}
        adjustsFontSizeToFit={true}
      >
        {l}
      </Text>}
    </View>
  );
};

AvatarTextComponent.propTypes = {
  label: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  labelStyle: PropTypes.object,
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