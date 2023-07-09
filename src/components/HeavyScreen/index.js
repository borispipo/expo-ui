import React from '$react';
import {useAfterInteractions }  from "./utils";
import { Transition } from 'react-native-reanimated'
import PropTypes from "prop-types";
import {Animated} from "react-native";
import { StylePropTypes } from '$theme';
import {isNumber,defaultStr} from "$cutils";

const OptimizedHeavyScreen = React.forwardRef(({
  style,
  children:cChildren,
  isLoading,
  timeout,
  testID,
  transitionTimeout,
  placeholder,
  enabled,
},ref) => {
  timeout = isNumber(timeout)? timeout : isNumber(transitionTimeout)? transitionTimeout : undefined;
  const { transitionRef, areInteractionsComplete } = useAfterInteractions(timeout);
  let Placeholder = placeholder;
  const children = React.useStableMemo(()=>cChildren,[cChildren]);
  if(enabled === false) return children;
  placeholder = React.isComponent(Placeholder)? <Placeholder /> : React.isValidElement(Placeholder)? Placeholder :  null;
  return (
    <Animated.View
      testID={defaultStr(testID,'RN_OptimizedHeavyScreen')}
      //transition={transition}
      style={[{flex:1},style]}
      ref={React.useMergeRefs(transitionRef,ref)}
    >
      {areInteractionsComplete && isLoading !==true ? (children) :  placeholder}
    </Animated.View>
  )
});

export default OptimizedHeavyScreen;

OptimizedHeavyScreen.propTypes = {
    transition: PropTypes.any,
    children : PropTypes.node,
    enabled : PropTypes.bool,//if heavry screen will be enabled
    style: StylePropTypes,
    timeout : PropTypes.number,
    transitionTimeout : PropTypes.number,
    placeholder : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
    ]),
    isLoading : PropTypes.bool,//si l'écan où les données sont en train d'être chargé
  }

  OptimizedHeavyScreen.displayName = "OptimizedHeavyScreenComponent";