import React from "react";
import { StyleSheet } from "react-native";
import View from "$components/View";
import { Raw } from "./animations/Raw";
import { SIZES } from "./tokens";


const Placeholder = ({
  children,
  style,
  Left,
  Right,
  Animation,
  ...props
}) => {
  const AnimationProvider = Animation || Raw;

  return (
    <AnimationProvider>
      <View style={[styles.row, style]} {...props}>
        {Left && <Left style={styles.left} />}
        <View style={styles.full}>{children}</View>
        {Right && <Right style={styles.right} />}
      </View>
    </AnimationProvider>
  );
};

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  left: {
    marginRight: SIZES.normal,
  },
  right: {
    marginLeft: SIZES.normal,
  },
  row: { flexDirection: "row", width: "100%" },
});


Placeholder.propTypes = {
  /* An optional component that animates the placeholder */
  //Animation?: React.ComponentType;
  /* An optional component to display on the left */
  //Left?: React.ComponentType<ViewProps>;
  /* An optional component to display on the right */
  //Right?: React.ComponentType<ViewProps>;
}

export default Placeholder;