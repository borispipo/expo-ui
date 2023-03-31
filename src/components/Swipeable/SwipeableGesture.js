import React  from '$react';
import {
  View,
  Animated,
  PanResponder
} from 'react-native';
import {defaultStr} from "$cutils";
import {isNativeMobile} from "$cplatform";

const useNativeDriver = isNativeMobile();


const SwipeableGestureComponent = React.forwardRef((props,ref)=>{
    const {disabled,onSwipe,style,animate:customAnimate,direction:directionProps,onSwipeLeft,children,onSwipeUp,onSwipeDown,onSwipeRight,...rest} = props;
    const animate = typeof customAnimate =='boolean'? customAnimate : true;
    const customDirection = defaultStr(directionProps).toLowerCase();
    const [state,setState] = React.useState({
      pan: new Animated.ValueXY(),
    });
    const context = {
      reset : ()=>pan.setValue({ x: 0, y: 0 }),
    }
    const {pan} = state;
    const panStyle = animate ? {
        transform: pan.getTranslateTransform()
    } : null;
    const panResponder = React.useRef(PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) =>true,// typeof disabled =='boolean'? disabled : true,
        onPanResponderMove: (e, gestureState) => {
            if (gestureState.dy > 0) {
                Animated.event([null, { dy: pan.y }], { useNativeDriver})(e, gestureState);
            }
        },
        onPanResponderRelease: (evt, gestureState) => {
          const x = gestureState.dx, y = gestureState.dy;
          let direction = undefined;
          if (Math.abs(x) > Math.abs(y)) {
            if (x >= 0) {
              direction = "right";
              if(onSwipeRight){
                 onSwipeRight();
              }
            }
            else {
              direction = "left";
              if(onSwipeLeft){
                 onSwipeLeft();
              }
            }
          }
          else {
            if (y >= 0) {
              direction = "down";
              if(onSwipeDown){
                onSwipeDown();
              }
            }
            else {
                direction = "up"
              if(onSwipeUp){
                onSwipeUp();
              }
            }
          }
          if(onSwipe){
                onSwipe({direction})
            }
        }
    })).current;
    return <Animated.View ref={ref} {...rest} style={[style,panStyle]} {...panResponder.panHandlers}>
    {children}
  </Animated.View>
});

SwipeableGestureComponent.displayName = "SwipeableGestureComponent";

export default SwipeableGestureComponent;