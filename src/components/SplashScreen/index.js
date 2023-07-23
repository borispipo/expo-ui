/* @flow */
/*** fork of https://www.npmjs.com/package/react-native-animated-splash-screen */
import PropTypes from "prop-types"
import React from "$react"
import {Animated, StyleSheet } from "react-native";
import View from "$ecomponents/View";
import {isNativeMobile} from "$cplatform";
import {defaultDecimal} from "$cutils";
import {LogoProgress} from "$ecomponents/Logo";
import { Provider as PaperProvider,Portal as PaperPortal} from "react-native-paper";
import {PortalProvider } from '$ecomponents/Portal';
import {defaultStr} from "$cutils";
import styles, {
  _solidBackground,
  _staticBackground,
  _dynamicLogoStyle,
  _dynamicCustomComponentStyle,
  _dynamicImageBackground,
  _dynamicBackgroundOpacity,
} from "./styles"
const isNative = isNativeMobile();
const Component = isNative? Animated.View : View;

const SplashScreenComponent = ({isLoaded,children , duration, delay,logoWidth,logoHeight,backgroundColor,imageBackgroundSource,imageBackgroundResizeMode,
  testID,
  disableAppScale,
  disableImageBackgroundAnimation,preload})=>{
  const [state,setState] = React.useState({
    animationDone: false,
    loadingProgress: new Animated.Value(0)
  });
  const { loadingProgress, animationDone } = state;
  const prevIsLoaded = React.usePrevious(isLoaded);
  React.useEffect(()=>{
    if(prevIsLoaded == isLoaded || !isLoaded) return;
    if(!isNativeMobile()){
      setState({...state,animationDone:true});
    } else {
      Animated.timing(loadingProgress, {
          toValue: 100,
          duration: duration || 1000,
          delay: delay || 0,
          useNativeDriver: true,
      }).start(() => {
          setState({
            ...state,
            animationDone: true,
          })
      })
    }
  },[isLoaded]);
  testID = defaultStr(testID,"RN_SplashscreenComponent")
  logoWidth = defaultDecimal(logoWidth,150);
  logoHeight = defaultDecimal(logoHeight,250);
  const opacityClearToVisible = {
    opacity: loadingProgress.interpolate({
      inputRange: [0, 15, 30],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    }),
  }
  const imageScale = {
    transform: [
      {
        scale: loadingProgress.interpolate({
          inputRange: [0, 10, 100],
          outputRange: [1, 1, 65],
        }),
      },
    ],
  }

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

  const appScale = {
    transform: [
      {
        scale: loadingProgress.interpolate({
          inputRange: [0, 7, 100],
          outputRange: [1.1, 1.05, 1],
        }),
      },
    ],
  }
  const child = (animationDone && isLoaded)? React.isValidElement(children) && children : null;
  return (
    <View style={[styles.container]} testID={testID} id={testID}>
      {!animationDone && <View style={StyleSheet.absoluteFill} testID={testID+"_Animation"}/>}
      <View style={styles.containerGlue}>
        {!animationDone && (
          <Animated.View
            style={_staticBackground(logoOpacity, backgroundColor)}
            testID={testID+"_AnimationDone"}
          />
        )}
        {(animationDone || isNative) && <Component style={[!disableAppScale && appScale, opacityClearToVisible, styles.flex]}>
          {child}
        </Component>}
        {!animationDone && (
          <Animated.Image
            testID={testID+"AnimateImage"}
            resizeMode={imageBackgroundResizeMode || "cover"}
            source={imageBackgroundSource}
            style={[disableImageBackgroundAnimation && _staticBackground(
              logoOpacity,
              backgroundColor
            ), disableImageBackgroundAnimation && _dynamicImageBackground(
              imageScale,
              logoOpacity,
              backgroundColor
            )]}
          />
        )}
        {!animationDone && (
          <PortalProvider>
            <PaperProvider>
              <PaperPortal.Host>
                  <View testID={testID+"_LogoContainer"} style={[StyleSheet.absoluteFill, styles.logoStyle]}>
                  {(
                    <Animated.View
                      testID={testID+"_Logo"}
                      style={_dynamicCustomComponentStyle(
                            logoScale,
                            logoOpacity,
                            logoWidth,
                            logoHeight
                        )}>
                      {<LogoProgress/>}
                    </Animated.View>
                  )}
                </View>
              </PaperPortal.Host>
            </PaperProvider>
          </PortalProvider>
        )}
      </View>
    </View>
  )
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