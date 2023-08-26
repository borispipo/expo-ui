import React from "$react";
import { Animated} from "react-native";
import PropTypes from "prop-types";
import {translateByAppearFrom,inputRangeByAppearFrom,animationType,outputRangeByAppearFrom,initialPositionByAppearFrom} from "./utils";

const WebAnimationComponent = React.forwardRef(({ delay,children,style, animationPosition,animationDuration,enteringCallback,exitingCallback,...viewProps},ref) => {
  if(!animationPosition || !initialPositionByAppearFrom[animationPosition]){
    animationPosition = 'up';
  }
  const [animatedValue] = React.useState(new Animated.Value(initialPositionByAppearFrom[animationPosition]));
  const animate = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start((args)=>{
      if(enteringCallback){
        enteringCallback(args);
      }
    });
  };
  React.useEffect(() => {
    const timeout = setTimeout(animate, delay);
    return () => {
      clearTimeout(timeout);
      animate();
    };
  }, []);

  const inputRange = inputRangeByAppearFrom[animationPosition];
  const outputRange = outputRangeByAppearFrom[animationPosition];
  const opacity = animatedValue.interpolate({
    inputRange,
    outputRange,
  });
  const transform = [{ [translateByAppearFrom[animationPosition]]: animatedValue }];

  return (
    <Animated.View ref={ref} {...viewProps} style={[style,{ opacity, transform }]}>
      {children}
    </Animated.View>
  );
});

WebAnimationComponent.propTypes = {
  delay: PropTypes.number,
  enteringCallback : PropTypes.func,
  animationPosition: PropTypes.oneOf([
    'left','down',"right","up"
  ]),
  animationDuration: PropTypes.number
}
export default WebAnimationComponent;