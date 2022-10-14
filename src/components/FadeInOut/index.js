import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import PropTypes from "prop-types";
import { StyleProp } from "$theme";

const DEFAULT_DURATION = 300;


const FadeInOutComponent = React.forwardRef(({
  children,
  visible,
  duration = DEFAULT_DURATION,
  rotate,
  scale,
  style,
  onShow,
  useNativeDriver = true,
  ...rest
},ref) => {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: duration,
      useNativeDriver: useNativeDriver,
    }).start();
    setTimeout(()=>{
      if(visible && onShow){
        onShow();
      }
    },10)
  }, [visible]);

  const transform = [{ perspective: 1000 }];

  if (scale) {
    transform.push({ scale: fadeAnim });
  }

  if (rotate) {
    transform.push({
      rotate: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
      }),
    });
  }
  rest = Object.assign({},rest);
  return (
    <Animated.View testID={'RN_FadeInOut'} {...rest} ref={ref} style={[style,{ opacity: fadeAnim, transform }]}>
      {children}
    </Animated.View>
  );
});

export default FadeInOutComponent;

FadeInOutComponent.propTypes = {
  visible: PropTypes.bool,
  children : PropTypes.any,
  duration : PropTypes.number,
  rotate : PropTypes.bool,
  scale : PropTypes.bool,
  style : StyleProp,
  onShow : PropTypes.func,
  useNativeDriver : PropTypes.bool,
}

FadeInOutComponent.displayName = "FadeInOutComponent";