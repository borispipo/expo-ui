import * as React from '$react';
import { StyleSheet} from 'react-native';
import View from "$ecomponents/View";
import theme,{StylePropTypes,DISABLED_OPACITY } from '$theme';
import PropTypes from "prop-types";


const Divider = React.forwardRef(({ inset,disabled, style,...rest },ref) => {
  return (
    <View
      {...rest}
      ref = {ref}
      style={[
        styles.main,
        {backgroundColor : theme.colors.divider},
        inset && styles.inset,
        style,
        disabled && theme.styles.disabled,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  main : {
    width:'100%',
    height : StyleSheet.hairlineWidth,
  },
  inset: {
    marginLeft: 72,
  },
});

Divider.displayName = "DividerComponent";

Divider.propTypes = {
    /**
   *  Whether divider has a left inset.
   */
  inset : PropTypes.bool,
  style : StylePropTypes,
  disabled : PropTypes.bool,
}
export default Divider;