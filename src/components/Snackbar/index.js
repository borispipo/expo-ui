// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from '$react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import theme from "$theme";
import {defaultObj,isObj,defaultStr} from "$cutils";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useEventCallback from 'use-event-callback';
import PropTypes from "prop-types";
import Surface from '$ecomponents/Surface';
import Label from "$ecomponents/Label"
import Button from "$components/Button";

const DURATION_SHORT = 4000;
const DURATION_MEDIUM = 7000;
const DURATION_LONG = 10000;

const Snackbar = ({
  visible,
  action,
  icon,
  duration = DURATION_MEDIUM,
  onDismiss,
  children,
  labelProps,
  elevation = 2,
  containerProps,
  style,
  testID,
  contentProps,
  ...rest
}) => {
  labelProps = defaultObj(labelProps);
  containerProps = defaultObj(containerProps);
  contentProps = defaultObj(contentProps);
  labelProps = defaultObj(labelProps);
  const { bottom, right, left } = useSafeAreaInsets();
  testID = defaultStr(testID,"RN_SnackbarComponent")
  const { current: opacity } = React.useRef(
    new Animated.Value(0.0)
  );
  const hideTimeout = React.useRef(undefined);
  const flattenStyle = StyleSheet.flatten(style) || {};
  const [hidden, setHidden] = React.useState(!visible);

  const scale = 1.0;

  const handleOnVisible = useEventCallback(() => {
    // show
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setHidden(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200 * scale,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        const isInfinity =
          duration === Number.POSITIVE_INFINITY ||
          duration === Number.NEGATIVE_INFINITY;

        if (!isInfinity) {
          hideTimeout.current = setTimeout(
            onDismiss,
            duration
          );
        }
      }
    });
  });

  const handleOnHidden = useEventCallback(() => {
    // hide
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: 100 * scale,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setHidden(true);
      }
    });
  });

  React.useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (visible) {
      handleOnVisible();
    } else {
      handleOnHidden();
    }
  }, [visible, handleOnVisible, handleOnHidden]);

  const roundness = theme.roundness, colors = theme.colors;
  action = React.isValidElement(action)? action : isObj(action) ? <Button {...action}/> : null;
  if (hidden) {
    return null;
  }

  const containerPaddings = {
    paddingBottom: bottom,
    paddingHorizontal: Math.max(left, right),
  };
  action = React.isValidElement(action)? action : null;
  return (
    <View
      testID={testID+"_Container"}
      {...containerProps}
      pointerEvents="box-none"
      style={[styles.wrapper, containerPaddings,action && theme.styles.pr1,containerProps.style]}
    >
      <Surface
        pointerEvents="box-none"
        accessibilityLiveRegion="polite"
        elevation = {elevation}
        {...rest}
        testID={testID}
        style={[
              styles.container,
              {
                borderRadius: roundness,
                opacity: opacity,
                transform: [
                  {
                    scale: visible
                      ? opacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        })
                      : 1,
                  },
                ],
              },
            style
        ]}
      >
        {<View testID={testID+"_Content"} {...contentProps} style={[styles.content,contentProps.style,action && theme.styles.pr1]}>
            {typeof children =='string' || typeof children ==='string' ?
             <Label {...labelProps} style={[{color:flattenStyle.color,backgroundColor:flattenStyle.backgroundColor},labelProps.style]}>
                {children}
            </Label> : React.isValidElement(children)? children : null}
        </View>}
        {action}
      </Surface>
    </View>
  );
};

/**
 * Show the Snackbar for a short duration.
 */
Snackbar.DURATION_SHORT = DURATION_SHORT;

/**
 * Show the Snackbar for a medium duration.
 */
Snackbar.DURATION_MEDIUM = DURATION_MEDIUM;

/**
 * Show the Snackbar for a long duration.
 */
Snackbar.DURATION_LONG = DURATION_LONG;

Snackbar.propTypes = {
    /**
     * Whether the Snackbar is currently visible.
     */
    visible: PropTypes.bool,
    /**
     * Label and press callback for the action button. It should contain the following properties:
     * - `label` - Label of the action button
     * - `onPress` - Callback that is called when action button is pressed.
     */
    action: PropTypes.oneOfType([
        PropTypes.shape({
            label: PropTypes.string,
        }),
        PropTypes.node,
        PropTypes.element,
    ]),
    duration : PropTypes.number,
    /**
     * Callback called when Snackbar is dismissed. The `visible` prop needs to be updated when this is called.
     */
    onDismiss: PropTypes.func,
    /**
     * Text content of the Snackbar.
     */
    children: PropTypes.any,
    containerProps : PropTypes.object,
    contentProps : PropTypes.object,
  };

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    flexWrap : "wrap",
    justifyContent: 'space-between',
    margin: 0,
    marginHorizontal : 10,
    paddingRight : 10,
    borderRadius: 4,
    minHeight: 48,
  },
  content: {
    marginHorizontal: 16,
    marginVertical: 14,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 48,
  },
  button: {
    marginRight: 8,
    marginLeft: 4,
  },
  elevation: {
    elevation: 6,
  },
  icon: {
    width: 40,
    height: 40,
    margin: 0,
  },
});

export default theme.withStyles(Snackbar,"SnackbarComponent");