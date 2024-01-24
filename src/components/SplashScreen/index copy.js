//@see : https://www.npmjs.com/package/react-native-animated-splash-screen

/* @flow */
import PropTypes from "prop-types"
import * as React from "react"
import { Animated, StatusBar, StyleSheet } from "react-native"
import styles, {
  _staticBackground,
  _dynamicLogoStyle,
  _dynamicCustomComponentStyle,
  _dynamicImageBackground,
  _dynamicBackgroundOpacity,
} from "./AnimatedSplash.style";
import View from "$ecomponents/View";
import {isNativeMobile} from "$cplatform";
import {defaultDecimal} from "$cutils";
import {LogoProgress} from "$ecomponents/Logo";
import { Portal } from "react-native-paper";
import {defaultStr} from "$cutils";

class AnimatedSplash extends React.Component {
  static defaultProps = {
    isLoaded: false,
  }

  state = {
    animationDone: false,
    loadingProgress: new Animated.Value(0),
    showStatusBar: true,
  }

  componentDidUpdate(prevProps) {
    const { isLoaded , duration, delay } = this.props
    const { loadingProgress } = this.state
    if (isLoaded && !prevProps.isLoaded) {
      Animated.timing(loadingProgress, {
        toValue: 100,
        duration: duration || 1000,
        delay: delay || 0,
        useNativeDriver: isNativeMobile(),
      }).start(() => {
        this.setState({
          animationDone: true,
        })
      })
    }
  }

  renderChildren() {
    const { children, preload, isLoaded } = this.props
    if (isLoaded) {
        return children
    }
    return null
  }

  render() {
    const { loadingProgress, animationDone } = this.state
    const {
      logoImage,
      logoWidth,
      logoHeight,
      backgroundColor,
      customComponent,
      disableAppScale,
    } = this.props

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
    const testID = defaultStr(testID,"RN_MainSplashScreen");
    const {Component} = this.props;
    return (
      <View testID={testID} style={[styles.container]}>
        {!animationDone && <View style={StyleSheet.absoluteFill} testID={`${testID}_AbsoluteFill`} />}
        <View style={styles.containerGlue} testID={`${testID}_ContainerGlue`}>
          {!animationDone && (
            <Animated.View
              testID={`${testID}_StaticBackground`}
              style={_staticBackground(logoOpacity, backgroundColor)}
            />
          )}
          <Animated.View testID={`${testID}_ChildrenContainer`} style={[!disableAppScale && appScale, opacityClearToVisible, styles.flex]}>
            {this.renderChildren()}
          </Animated.View>
          {!animationDone && (React.isComponent(Component)? <Component testID={testID+"_CustomSplashComponent"}/> : 
            <View testID={`${testID}_AbsoluteFillContainer`} style={[StyleSheet.absoluteFill, styles.logoStyle]}>
              {<View testID={testID+"_LogoContainer"} style={[StyleSheet.absoluteFill,{backgroundColor}, styles.logoStyle]}>
                    <Animated.View
                      testID={testID+"_LogoProgressContainer"}
                      style={_dynamicCustomComponentStyle(
                            logoScale,
                            logoOpacity,
                            logoWidth,
                            logoHeight
                        )}>
                      {<LogoProgress />}
                    </Animated.View>
                </View>}
            </View>
          )}
        </View>
      </View>
    )
  }
}

AnimatedSplash.propTypes = {
  preload: PropTypes.bool,
  logoWidth: PropTypes.number,
  children: PropTypes.element,
  logoHeight: PropTypes.number,
  backgroundColor: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
  translucent: PropTypes.bool,
  customComponent: PropTypes.element,
  disableAppScale: PropTypes.bool,
  duration: PropTypes.number,
  delay: PropTypes.number,
}

export default AnimatedSplash