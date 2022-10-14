import * as React from 'react';
import { StyleSheet, Text, Platform} from 'react-native';
import { black } from "$theme/defaultTheme";
import theme from "$theme";
let MaterialCommunityIcons = undefined;

try {
  // Optionally require vector-icons
  MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;
} catch (e) {
  let isErrorLogged = false;

  // Fallback component for icons
  MaterialCommunityIcons = ({ name, color, size, ...rest }) => {
    /* eslint-disable no-console */
    if (!isErrorLogged) {
      if (
        !/(Cannot find module|Module not found|Cannot resolve module)/.test(
          (e).message
        )
      ) {
        console.error(e);
      }

      console.warn(
        `Tried to use the icon '${name}' in a component from 'react-native-paper', but 'react-native-vector-icons/MaterialCommunityIcons' could not be loaded.`,
        `To remove this warning, try installing 'react-native-vector-icons' or use another method to specify icon: https://callstack.github.io/react-native-paper/icons.html.`
      );

      isErrorLogged = true;
    }
    
    return (
      <Text
        {...rest}
        style={[styles.icon, { color, fontSize: size }]}
        // @ts-expect-error: Text doesn't support this, but it seems to affect TouchableNativeFeedback
        pointerEvents="none"
        selectable={false}
      >
        □
      </Text>
    );
  };
}

export const accessibilityProps =
  Platform.OS === 'web'
    ? {
        role: 'img',
        focusable: false,
      }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility:
          'no-hide-descendants',
      };

const defaultIcon = ({
  name,
  color = theme.colors.text,
  size,
  direction,
  allowFontScaling,
  ...rest
}) => (
  <MaterialCommunityIcons
    pointerEvents="none"
    {...rest}
    allowFontScaling={allowFontScaling}
    name={name}
    color={color}
    size={size}
    style={[
      {
        transform: [{ scaleX: direction === 'rtl' ? -1 : 1 }],
        lineHeight: size,
      },
      styles.icon,
      rest.style,
    ]}
    selectable={false}
    {...accessibilityProps}
  />
);

const styles = StyleSheet.create({
  icon: {
    backgroundColor: 'transparent',
  },
});

export default theme.withStyles(defaultIcon,"MaterialIconComponent");