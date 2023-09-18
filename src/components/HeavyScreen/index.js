import React from '$react';
import PropTypes from "prop-types";
import { StylePropTypes } from '$theme';
import {isNumber,defaultStr} from "$cutils";
import { useNavigation } from '$enavigation/utils';
import { StyleSheet } from 'react-native';

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
  timeout = isNumber(timeout)? timeout : isNumber(transitionTimeout)? transitionTimeout : 500;
  const navigation = useNavigation();
  const transitionStaredRef = React.useRef(false);
  const [isScreenLoaded,setIsScreenLoaded] = React.useState(false);
    React.useEffect(() => {
      const unsubscribe1 = navigation.addListener('transitionStart', (e) => {
        // Do something
        transitionStaredRef.current = true;
      });
      const unsubscribe = navigation.addListener('transitionEnd', (e) => {
          // Do something
          if(isScreenLoaded) return;
          setIsScreenLoaded(true);
      });
      setTimeout(()=>{
        if(transitionStaredRef.current){
            return;
        }
        if(isScreenLoaded) return;
        setIsScreenLoaded(true);
      },timeout)
      return ()=>{
          transitionStaredRef.current = false;
          unsubscribe && unsubscribe();
          unsubscribe1 && unsubscribe1();
      }
    }, [navigation]);
  const Placeholder = placeholder;
  const children = React.useStableMemo(()=>cChildren,[cChildren]);
  if(enabled === false && isScreenLoaded) return children;
  placeholder = React.isComponent(Placeholder)? <Placeholder /> : React.isValidElement(Placeholder)? Placeholder :  null;
  return isScreenLoaded && isLoading !==true ? (children) :  placeholder;
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
  
  const styles = StyleSheet.create({
    container : {
        backgroundColor : 'transparent'
    }
  })