import Icon from "$ecomponents/Icon";
import { forwardRef } from 'react';
import PropTypes from "prop-types";
import {isIos} from "$cplatform";

const AppbarBackAction = forwardRef(
  ({ accessibilityLabel = 'Back', ...rest }, ref) => {
    console.log("will render ",rest);
    return (
        <Icon
          accessibilityLabel={accessibilityLabel}
          icon={isIos()?"chevron-left":"arrow-left"}
          {...rest}
          isLeading
          ref={ref}
        />
      );
  }
);

AppbarBackAction.displayName = 'AppBar.BackAction';

export default AppbarBackAction;

AppbarBackAction.propTypes = {
    /**
   *  Custom color for back icon.
   */
  color: PropTypes.string,
  /**
   * Optional icon size.
   */
  size : PropTypes.number,
  /**
   * Whether the button is disabled. A disabled button is greyed out and `onPress` is not called on touch.
   */
  disabled : PropTypes.bool,
  /**
   * Accessibility label for the button. This is read by the screen reader when the user taps the button.
   */
  accessibilityLabel : PropTypes.string,
  /**
   * Function to execute on press.
   */
  onPress : PropTypes.func,
}