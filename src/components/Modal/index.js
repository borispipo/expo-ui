import React from "$react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import View from "$ecomponents/View";
import BackHandler from "$ecomponents/BackHandler";
import PropTypes from "prop-types";
import theme,{StyleProp} from "$theme";
import Animation from "$ecomponents/Animation";
//import { Surface } from "react-native-paper";
import { Platform } from "react-native";
import Surface from "$ecomponents/Surface";
import { Portal } from "react-native-paper";
import {defaultStr} from "$cutils";
import {
  getStatusBarHeight,
  getBottomSpace,
} from 'react-native-iphone-x-helper';
import {isMobileNative} from "$cplatform";

import {defaultObj} from "$cutils";

const TOP_INSET = getStatusBarHeight(true);
const BOTTOM_INSET = getBottomSpace();

const ModalComponent = React.forwardRef((props,ref)=>{
    let  {
        dismissable = true,visible = false,
        overlayAccessibilityLabel = 'Close modal',
        backdropProps,
        onPressOut,
        onPressIn,
        onLongPress,
        contentContainerProps,
        animationType,
        animationDuration,
        animationPosition,
        contentContainerRef,
        onShow,
        animate,
        onDismiss,
        isPreloader,
        children,
        testID,
        ...rest
    } = props;
    testID = 'RN__ModalComponent__'+defaultStr(testID);
    if(animate !== false && isMobileNative() && defaultStr(animationType).toLowerCase().trim() !=='slide'){
       animate = false;
    }
    rest = defaultObj(rest);
    contentContainerProps = defaultObj(contentContainerProps);
    backdropProps = defaultObj(backdropProps);
    const subscription = React.useRef(null);
    const handleBack = React.useCallback((e)=>{
      if (dismissable) {
        hideModal(e);
      }
      return true;
    },[dismissable])
    const removeListeners = ()=>{
      if (subscription.current?.remove) {
        subscription.current.remove();
      } else {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      }
    }
    const addListener = ()=>{
      removeListeners();
      subscription.current = React.addEventListener(
        BackHandler,
        'hardwareBackPress',
        handleBack
      );
    }
    const hideModal = (e)=>{
      removeListeners();
      if(onDismiss){
        onDismiss(e);
      }
    }
    React.useEffect(()=>{
      addListener();
       return ()=>{
         removeListeners();
       }
    },[]);
    const callback = React.useCallback((e) => {
      //console.log(e," is animation callback, ",visible);
    },[onDismiss, onShow, visible]);
    const prevVisible = React.usePrevious(visible);
    React.useEffect((e) => {
      if(visible){
        addListener();
      } else {
        removeListeners();
      }
      setTimeout(()=>{
        if(prevVisible ===visible) return;
        if(visible){
           if(onShow){
            onShow();
           }
        }
      },100);
    },[visible]);
    const Anim = React.useMemo(()=>{
      return animate ? Animation  : View;
    },[animate]);
    const wrapperProps = animate ? {enteringCallback:callback,exitingCallback:callback} : {};
    return !visible?null: <Portal>
      <TouchableWithoutFeedback
        aria-label={overlayAccessibilityLabel}
        //role="button"
        disabled={!dismissable}
        onPress={dismissable ? hideModal : undefined}
        importantForAccessibility="no"
        testID={testID+"__backdrop_Container"}
      >
        <View
          testID={testID+"__backdrop"}
          {...backdropProps}
          mediaQueryUpdateStyle = {({width,height})=>{
            return {width,height};
          }}
          style={[
            styles.backdrop,
            {backgroundColor:theme.colors.backdrop},
            backdropProps.style,
          ]}
        />
      </TouchableWithoutFeedback>
      <Anim
        ref={ref}
        {...rest}
        accessibilityViewIsModal
        role="polite"
        onAccessibilityEscape={hideModal}
        style = {[styles.modal,rest.style,{pointerEvents:visible ? 'auto' : 'none'}]}
        animationType = {animationType}
        animationDuration = {animationDuration}
        animationPosition = {animationPosition}
        testID={testID}
      >
          <Surface 
              elevation = {5}
              {...contentContainerProps}
              {...wrapperProps}
              ref = {contentContainerRef}
              testID={testID+"__ModalContentContainer"}
              style={[styles.contentContainer,styles.surface,contentContainerProps.style]}
          >
            {children}  
          </Surface>
      </Anim>
    </Portal>
});


const styles = StyleSheet.create({
  modal : {
    ...StyleSheet.absoluteFillObject,
    height : "100%",
    width : "100%",
  },
  surface : { 
    marginTop: TOP_INSET, 
    marginBottom: BOTTOM_INSET,
    backgroundColor:'transparent',
    height : "100%"
  },
  backdrop: {
    flex: 1,
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents : "box-none",
    alignItems : 'center',
    justifyContent : 'center',
    flex : 1,
    alignSelf : 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: 'rgba(0, 0, 0, .3)',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
      },
    }),
  },
  hidden : {opacity:0},
});

ModalComponent.displayName = 'ModalComponent';

export default ModalComponent;

ModalComponent.propTypes = {
    /**
   * Determines whether clicking outside the modal dismiss it.
   */
  dismissable : PropTypes.bool,
  /**
   * Callback that is called when the user dismisses the modal.
   */
  onDismiss : PropTypes.func,
  onShow : PropTypes.func,
  /**
   * Accessibility label for the overlay. This is read by the screen reader when the user taps outside the modal.
   */
  overlayAccessibilityLabel : PropTypes.string,
  /**
   * Determines Whether the modal is visible.
   */
  visible: PropTypes.bool,
  /**
   * Content of the `Modal`.
   */
  children : PropTypes.node,
  /**
   * Style for the contentContainer of the modal.
   * Use this prop to change the default contentContainer style or to override safe area insets with marginTop and marginBottom.
   */
  style : StyleProp,
  animate : PropTypes.bool,
  backdropProps : PropTypes.object,
}