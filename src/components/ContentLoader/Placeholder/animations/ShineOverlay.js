import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet} from "react-native";
import View from "$components/View";

const START_VALUE = 0;
const END_VALUE = 100;
const isInteraction = false;

export const ShineOverlay = ({
  duration,
  children,
  reverse,
}) => {
  const animation = useRef(new Animated.Value(START_VALUE));

  const start = () => {
    animation.current.setValue(START_VALUE);

    Animated.timing(animation.current, {
      duration: duration || 750,
      isInteraction,
      toValue: END_VALUE,
      useNativeDriver: false,
    }).start((e) => {
      if (e.finished) {
        start();
      }
    });
  };

  useEffect(() => {
    start();
  }, []);

  const left = animation.current.interpolate({
    inputRange: [START_VALUE, END_VALUE],
    outputRange: reverse ? ["100%", "0%"] : ["0%", "100%"],
  });

  return (
    <View>
      {children}
      <Animated.View style={[styles.shine, { left }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  shine: {
    backgroundColor: "#ffffff",
    height: "100%",
    opacity: 0.4,
    position: "absolute",
    width: 30,
  },
});
