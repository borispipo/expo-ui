 import React from "$react";
 import PropTypes from "prop-types";
 import {animationsPropTypes,getAnimations} from "./utils";
 import Animated,{useAnimatedStyle,withTiming} from "react-native-reanimated";

 export const ANIMATION_DURATION = 300;
 
 const AnimationComponent = React.forwardRef(function AnimationComponent({animationType,animationPosition,enteringCallback,exitingCallback,animationDuration,...rest},ref) {
   const rProps = defaultObj(rest);
   const duration =  animationDuration || ANIMATION_DURATION;
    let animations = getAnimations(animationType,animationPosition);
    const style = useAnimatedStyle(() => {
      return {};
    });
    enteringCallback = enteringCallback || function(e){console.log(e," is entering")};
    exitingCallback = exitingCallback || function(e){console.log(e," is animation exiting")};
    if(animations.entering && animations.exiting){
        animations.entering.duration(duration).withCallback(enteringCallback);
        animations.exiting.duration(duration).withCallback(exitingCallback);
    } else {
      animations = getDefaultAnimation({duration,enteringCallback,exitingCallback});
    }
    
    return <Animated.View
        testID={'RN_AnimationComponentComponent'}
        ref = {ref}
        {...rProps}
        style = {[rest.style,style]}
        {...animations}
    />
 });

AnimationComponent.displayName = "AnimationComponent";

export default AnimationComponent;

 AnimationComponent.propTypes = {
    ...animationsPropTypes,
    animationDuration : PropTypes.number,
    children : PropTypes.any,
    enteringCallback : PropTypes.func,
    exitingCallback : PropTypes.func,
}


export const getDefaultAnimation = ({enteringCallback,exitingCallback,duration})=>{
  return {
     entering : (targetValues) => {
      'worklet';
      return {
        callback : enteringCallback,
        duration,
        initialValues: {
          transform: [
            { translateY: targetValues.targetHeight / 2 },
            { perspective: 500 },
            { rotateX: '90deg' },
            { translateY: -targetValues.targetHeight / 2 },
            { translateY: 300 },
          ],
        },
        animations: {
          transform: [
            { translateY: withTiming(targetValues.targetHeight / 2) },
            { perspective: withTiming(500) },
            { rotateX: withTiming('0deg') },
            { translateY: withTiming(-targetValues.targetHeight / 2) },
            { translateY: withTiming(0) },
          ],
        },
      };
    },
    exiting : (targetValues) => {
      'worklet';
      return {
        callback : exitingCallback,
        duration,
        initialValues: {},
        animations: {
          transform: [
            { translateY: withTiming(targetValues.currentHeight / 2) },
            { perspective: withTiming(500) },
            { rotateX: withTiming('90deg') },
            { translateY: withTiming(-targetValues.currentHeight / 2) },
            { translateY: withTiming(300) },
          ],
        },
      };
    }
  }
  return {entering,exiting};
}