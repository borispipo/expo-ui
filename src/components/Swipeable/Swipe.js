import React from '$react';
import {
  PanResponder,
  Animated,
  Dimensions,
  Button,
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from "prop-types";
import {StyleProp} from "$theme";
import {defaultStr,defaultObj} from "$cutils";

/** We offer a special kind of ListItem which is swipeable from both ends and allows users select an event. */
export const SwipeableComponent = React.forwardRef(({
  children,
  leftProps,
  rightProps,
  left,
  right,
  onSwipeBegin,
  onSwipeEnd,
  animation = { type: 'spring', duration: 200 },
  testID,
  contentProps,
  containerProps,
  leftWidth,
  rightWidth,
  ...rest
},ref) => {
  testID = defaultStr(testID,"RN_SwipeableComponent");
  containerProps = defaultObj(contentProps);
  contentProps = defaultObj(contentProps);
  leftProps = defaultObj(leftProps);
  rightProps = defaultObj(rightProps);

  const screenWidth = Dimensions.get("window").width;
  const rightStyle = Object.assign({},StyleSheet.flatten(rightProps.style));
  rightStyle.width = rightWidth || rightStyle.width || screenWidth/3;
  const leftStyle = Object.assign({},leftProps.style);
  leftStyle.width = leftWidth || leftStyle.width || screenWidth/3;
  const translateX = React.useRef(new Animated.Value(0));
  const panX = React.useRef(0);

  const slideAnimation = React.useCallback(
    (toValue) => {
      panX.current = toValue;
      Animated[animation.type || 'spring'](translateX.current, {
        toValue,
        useNativeDriver: true,
        duration: animation.duration || 200,
      }).start();
    },
    [animation.duration, animation.type]
  );

  const resetCallBack = React.useCallback(() => {
    slideAnimation(0);
  }, [slideAnimation]);

  const onMove = React.useCallback(
    (_, { dx }) => {
      translateX.current.setValue(panX.current + dx);
    },
    []
  );

  const onRelease = React.useCallback(
    (_, { dx }) => {
      if (Math.abs(panX.current + dx) >= ScreenWidth / 3) {
        slideAnimation(panX.current + dx > 0 ? leftStyle.width : -rightStyle.width);
      } else {
        slideAnimation(0);
      }
    },
    [leftStyle.width, rightStyle.width, slideAnimation]
  );

  const shouldSlide = React.useCallback(
    (_, { dx, dy, vx, vy }) => {
      if (dx > 0 && !left && !panX.current) {
        return false;
      }
      if (dx < 0 && !right && !panX.current) {
        return false;
      }
      return (
        Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(vx) > Math.abs(vy) * 2.5
      );
    },
    [left, right]
  );

  const _panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: shouldSlide,
        onPanResponderGrant: (_event, { vx }) => {
          onSwipeBegin?.(vx > 0 ? 'left' : 'right');
        },
        onPanResponderMove: onMove,
        onPanResponderRelease: onRelease,
        onPanResponderReject: onRelease,
        onPanResponderTerminate: onRelease,
        onPanResponderEnd: () => {
          onSwipeEnd?.();
        },
      }),
    [onMove, onRelease, onSwipeBegin, onSwipeEnd, shouldSlide]
  );
  
  return (
    <View
      testID = {testID+"_Container"}
      {...containerProps}
      style={[{justifyContent: 'center' },containerProps.style]}
    >
      <View testID={testID+"_Actions"} style={styles.actions}>
        <View
         testID = {testID+"_Left"}
          {...leftProps}
          style={[
            {
              zIndex: 1,
            },
            leftStyle,
          ]}
        >
          {typeof left === 'function'
            ? left(resetCallBack)
            : left}
        </View>
        <View style={{ flex: 0 }} />
        <View
          testID = {testID+"_Right"}
          {...rightProps}
          style={[
            {
              zIndex: 1,
            },
            rightStyle,
          ]}
        >
          {typeof right === 'function'
            ? right(resetCallBack)
            : right}
        </View>
      </View>
      <Animated.View
        ref = {ref}
        testID={testID}
        {...rest}
        style={[{
            transform: [
              {
                translateX: translateX.current,
              },
            ],
          },rest.style]}
        {..._panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
    actions: {
      bottom: 0,
      left: 0,
      overflow: 'hidden',
      position: 'absolute',
      right: 0,
      top: 0,
  
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });

SwipeableComponent.displayName = 'SwipeableComponent';

SwipeableComponent.propTypes = {
     /**
   * Left Content.
   * @type ReactNode or resetCallback => ReactNode
   */
  left: PropTypes.oneOfType([PropTypes.func,PropTypes.node]),// | ((reset: () => void) => React.ReactNode);

  /**
   *  Right Content.
   * @type ReactNode or resetCallback => ReactNode
   */
  right: PropTypes.oneOfType([PropTypes.func,PropTypes.node]),//?: React.ReactNode | ((reset: () => void) => React.ReactNode);

  /** Style of left container.*/
  leftProps : PropTypes.object,

  /** Style of right container.*/
  rightProps : PropTypes.object,
  
   /** Width to swipe left. */
  leftWidth : PropTypes.number,
  /** Width to swipe right. */
  rightWidth : PropTypes.number,

  /** Handler for swipe in either direction */
  onSwipeBegin : PropTypes.func,///?: (direction: 'left' | 'right') => unknown;

  /** Handler for swipe end. */
  onSwipeEnd : PropTypes.func,//?: () => unknown;

  /** Decide whether to show animation.
   * @default Object with duration 350ms and type timing
   * @type Animated.TimingAnimationConfig
   */
  animation : PropTypes.shape({
    type : PropTypes.oneOf(['timing', 'spring']),
    duration: PropTypes.number,
  }),
}

export default SwipeableComponent;