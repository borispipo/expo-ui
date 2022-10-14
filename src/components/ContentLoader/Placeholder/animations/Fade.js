import React, { useRef } from "react";
import { Animated, ViewProps } from "react-native";
import { AnimationContext } from "./context";
import { getBackgroundColor } from "../../utils";

const START_VALUE = 0;
const END_VALUE = 1;
const useNativeDriver = true;
const isInteraction = false;


const Fade = ({
  duration = 500,
  children,
  style,
}) => {
  const animation = useRef(new Animated.Value(START_VALUE));

  const start = () => {
    Animated.sequence([
      Animated.timing(animation.current, {
        duration,
        isInteraction,
        toValue: END_VALUE,
        useNativeDriver,
      }),
      Animated.timing(animation.current, {
        duration,
        isInteraction,
        toValue: START_VALUE,
        useNativeDriver,
      }),
    ]).start((e) => {
      if (e.finished) {
        start();
      }
    });
  };

  React.useEffect(() => {
    start();
  }, []);

  const animationStyle = {
    backgroundColor: "#dfdfdf",
    height: "100%",
    opacity: animation.current,
  };

  return (
    <AnimationContext.Provider value={[animationStyle,{backgroundColor:getBackgroundColor()}, style]}>
      {children}
    </AnimationContext.Provider>
  );
};


export default Fade;