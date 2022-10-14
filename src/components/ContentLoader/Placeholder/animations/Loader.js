import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View
} from "react-native";

export const Loader = ({
  children,
  ...props
}) => (
    <View style={styles.loader}>
      {children}
      <ActivityIndicator {...props} style={[styles.indicator, props.style]} />
    </View>
);

const styles = StyleSheet.create({
  indicator: { position: "absolute", height: "100%" },
  loader: {
    alignItems: "center",
    justifyContent: "center"
  }
});
