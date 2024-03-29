/* @flow */
/*** fork of https://www.npmjs.com/package/react-native-animated-splash-screen */
import PropTypes from "prop-types"
import React from "$react"
import {Animated, StyleSheet } from "react-native";
import View from "$ecomponents/View";
import {isNativeMobile} from "$cplatform";
import {defaultDecimal} from "$cutils";
import {LogoProgress} from "$ecomponents/Logo";
import { Portal } from "react-native-paper";
import {defaultStr} from "$cutils";
import styles, {
  _solidBackground,
  _staticBackground,
  _dynamicLogoStyle,
  _dynamicCustomComponentStyle,
  _dynamicImageBackground,
  _dynamicBackgroundOpacity,
} from "./styles"
import {useAppComponent} from "$econtext/hooks";

const SplashScreenComponent = ({isLoaded,children , duration, delay,logoWidth,logoHeight,backgroundColor,imageBackgroundSource,imageBackgroundResizeMode,
  testID})=>{
  const [state,setState] = React.useState({
    animationDone: false,
    loadingProgress: new Animated.Value(0),
  });
  const { loadingProgress, animationDone} = state;
  const prevIsLoaded = React.usePrevious(isLoaded); 
  const timerRef = React.useRef(null);
  React.useEffect(()=>{
    if(isLoaded && !prevIsLoaded){
      Animated.timing(loadingProgress, {
          toValue: 100,
          duration: duration || 100,
          delay: delay || 0,
          useNativeDriver: isNativeMobile(),
      }).start(() => {
          setState({
            ...state,
            animationDone:true,
          })
      })
    } else if(isLoaded){
       clearTimeout(timerRef.current);
       timerRef.current = setTimeout(()=>{
          if(isLoaded && !animationDone){
            setState({...state,animationDone:true});
          }
          clearTimeout(timerRef.current);
       },delay|2000);
    }
  },[isLoaded,prevIsLoaded,animationDone]);
  testID = defaultStr(testID,"RN_SplashscreenComponent")
  logoWidth = defaultDecimal(logoWidth,150);
  logoHeight = defaultDecimal(logoHeight,250);
  const Component = useAppComponent("SplashScreen");

  const logoScale = {
    transform: [
      {
        scale: loadingProgress.interpolate({
          inputRange: [0, 10, 100],
          outputRange: [1, 0.8, 10],
        }),
      },
    ],
  }

  const logoOpacity = {
    opacity: loadingProgress.interpolate({
      inputRange: [0, 20, 100],
      outputRange: [1, 0, 0],
      extrapolate: "clamp",
    }),
  }
  if(isLoaded && animationDone){
      return React.isValidElement(children)?children:null;
  }
  return <>
      {!animationDone || !isLoaded ? <Portal>
          <View style={[styles.container,{backgroundColor}]} testID={testID} id={testID}>
            {<View style={[StyleSheet.absoluteFill,{backgroundColor}]} testID={testID+"_Animation"}/>}
            <View style={styles.containerGlue} testID={testID+"_ContainerGlue"}>
              {(
                <Animated.View
                  style={_staticBackground(logoOpacity, backgroundColor)}
                  testID={testID+"_AnimationDone"}
                />
              )}
              {(
                React.isComponent(Component)? <Component testID={testID+"_CustomSplashComponent"}/> : 
                <View testID={testID+"_LogoContainer"} style={[StyleSheet.absoluteFill,{backgroundColor}, styles.logoStyle]}>
                    <Animated.View
                      testID={testID+"_Logo"}
                      style={_dynamicCustomComponentStyle(
                            logoScale,
                            logoOpacity,
                            logoWidth,
                            logoHeight
                        )}>
                      {<LogoProgress />}
                    </Animated.View>
                </View>
              )}
            </View>
          </View>
      </Portal> : null}
  </>
}


SplashScreenComponent.propTypes = {
  preload: PropTypes.bool,
  logoWidth: PropTypes.number,
  children: PropTypes.element,
  logoHeight: PropTypes.number,
  backgroundColor: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
  disableBackgroundImage: PropTypes.bool,
  logoImage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
  disableAppScale: PropTypes.bool,
  duration: PropTypes.number,
  delay: PropTypes.number,
}

SplashScreenComponent.displayName = "SplashScreenComponent";
export default SplashScreenComponent;