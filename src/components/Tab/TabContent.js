import React from '$react';
import {StyleSheet,} from 'react-native';
import {defaultStr} from "$utils";
import Swiper from "$components/Swiper";
import PropTypes from "prop-types";
import { StylePropTypes } from '$theme';

const TabContentBase = ({
  children,
  onChange,
  activeIndex = 0,
  testId,
  ...rest
}) => {
  return (
    <Swiper
      {...rest}
      children = {children}
      testId = {defaultStr(testId,'RN_SwiperTabComponent')}
      activeIndex = {activeIndex}
      controlsEnabled = {false}
      onIndexChanged = {(index)=>onChange?.(index)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  hw100 : {
    width : '100%',
    height : '100%',
    minHeight : 200,
  },
  hidden : {
      display : 'none',
      //height : 0,
      //width : 0,
  }
});

TabContentBase.displayName = 'TabContent';


TabContentBase.propTypes =  {
    ...Swiper.propTypes,
    /** Child position index activeIndex. */
    activeIndex:PropTypes.number,
  
    /** On Index Change Callback. */
    onChange:PropTypes.func,
  
    /** Choose the animation type among `spring` and `timing`. This is visible when there is tab change. */
    animationType:PropTypes.oneOf([
        'spring',
        'timing',
    ]),
  
    /** Define the animation configurations. */
    animationConfig:PropTypes.object,
  
    /** Styling for Component container. */
    containerProps:PropTypes.object,
  
    /** Styling for TabContent.Item Component container. */
    tabItemContainerStyle:StylePropTypes
  }

  export default TabContentBase;