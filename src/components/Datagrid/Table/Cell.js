import * as React from 'react';
import { StyleSheet, StylePropTypes, ViewStyle } from 'react-native';
import {Text,TouchableRipple} from "react-native-paper";
import Label from "$components/Label";
import PropTypes from "prop-types";
import {styleTypeProps} from "$theme";

const DataTableCell = ({ children, style, numeric, ...rest }) => (
  <TouchableRipple
    {...rest}
    style={[styles.container, numeric && styles.right, style]}
  >
    <Text numberOfLines={1}>{children}</Text>
  </TouchableRipple>
);

DataTableCell.displayName = 'DataTable.Cell';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  right: {
    justifyContent: 'flex-end',
  },
});

export default DataTableCell;


DataTableCell.propTypes = {
    children: PropTypes.node,
    /**
     * Align the text to the right. Generally monetary or number fields are aligned to right.
     */
    numeric : PropTypes.bool,
    /**
     * Function to execute on press.
     */
    onPress : PropTypes.func,
    style : styleTypeProps,
  }