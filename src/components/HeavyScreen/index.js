import React from '$react';
import {useAfterInteractions }  from "./utils";
import { Transition, Transitioning } from 'react-native-reanimated'
import PropTypes from "prop-types";
import { StylePropTypes } from '$theme';
import {isNumber,defaultStr} from "$utils";

const OptimizedHeavyScreen = React.forwardRef(({
  transition = (
    <Transition.Together>
      <Transition.Change interpolation="easeInOut" />
      <Transition.In type="fade" />
    </Transition.Together>
  ),
  style,
  children,
  isLoading,
  timeout,
  testID,
  transitionTimeout,
  placeholder,
},ref) => {
  timeout = isNumber(timeout)? timeout : isNumber(transitionTimeout)? transitionTimeout : undefined;
  const { transitionRef, areInteractionsComplete } = useAfterInteractions(timeout);
  let Placeholder = placeholder;
  placeholder = React.isComponent(Placeholder)? <Placeholder /> : React.isValidElement(Placeholder)? Placeholder :  null;
  return (
    <Transitioning.View
      testID={defaultStr(testID,'RN_OptimizedHeavyScreen')}
      transition={transition}
      style={[{flex:1},style]}
      ref={React.useMergeRefs(transitionRef,ref)}
    >
      {areInteractionsComplete && isLoading !==true ? (children) :  placeholder}
    </Transitioning.View>
  )
});

export default OptimizedHeavyScreen;

OptimizedHeavyScreen.propTypes = {
    transition: PropTypes.any,
    children : PropTypes.node,
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