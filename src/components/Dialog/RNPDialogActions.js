import * as React from 'react';
import { StyleSheet, View,} from 'react-native';
import PropTypes from "prop-types";
import { StyleProp } from '$theme';
import {defaultStr} from "$utils";

const DialogActions = ({testID,...props}) => {
  testID = defaultStr(testID,"RNP_DialogActionsComponent")
  return (
    <View
      {...props}
      testID = {testID}
      style={[styles.container, props.style]}
    >
      {React.Children.map(props.children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              compact: true,
              testID : defaultStr(child?.props?.testID,testID+"_Action"),
              //style: child?.props?.style,
            })
          : child
      )}
    </View>
  );
};

DialogActions.displayName = 'Dialog.Actions';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 8,
  },
  v3Container: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
});

export default DialogActions;


DialogActions.propTypes = {
    children: PropTypes.node,
    style : StyleProp,
}