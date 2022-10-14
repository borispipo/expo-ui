import * as React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Icon, { isValidIcon, isEqualIcon } from './Icon';
import PropTypes from 'prop-types';
import theme from "$theme";
import {defaultStr,defaultObj} from "$utils";

const CrossFadeIcon = ({ color,testID,containerProps,style, size, source}) => {
  const [currentIcon, setCurrentIcon] = React.useState(
    () => source
  );
  testID = defaultStr(testID,"RN_CrossFadeIconComponent");
  const [previousIcon, setPreviousIcon] = React.useState(
    null
  );

  const { current: fade } = React.useRef(new Animated.Value(1));

  const { scale } = theme.animation;

  if (currentIcon !== source) {
    setPreviousIcon(() => currentIcon);
    setCurrentIcon(() => source);
  }

  React.useEffect(() => {
    if (isValidIcon(previousIcon) && !isEqualIcon(previousIcon, currentIcon)) {
      fade.setValue(1);

      Animated.timing(fade, {
        duration: scale * 200,
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [currentIcon, previousIcon, fade, scale]);

  const opacityPrev = fade;
  const opacityNext = previousIcon
    ? fade.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      })
    : 1;

  const rotatePrev = fade.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });
  containerProps = defaultObj(containerProps);
  const rotateNext = previousIcon
    ? fade.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-180deg'],
      })
    : '0deg';

  return (
    <View
      testID={testID+"_Container"}
      {...containerProps}
      style={[
        styles.content,
        {
          height: size,
          width: size,
        },
        containerProps.style
      ]}
    >
      {previousIcon ? (
        <Animated.View
          testID={testID+"_PrevIcon"}
          style={[
            styles.icon,
            {
              opacity: opacityPrev,
              transform: [{ rotate: rotatePrev }],
            },
          ]}
        >
          <Icon testID={testID+"_Left"} source={previousIcon} size={size} color={color} />
        </Animated.View>
      ) : null}
      <Animated.View
        testID={testID+"_RightIcon"}
        style={[
          styles.icon,
          {
            opacity: opacityNext,
            transform: [{ rotate: rotateNext }],
          },
        ]}
      >
        <Icon testID={testID+"_Right"} source={currentIcon} size={size} color={color} />
      </Animated.View>
    </View>
  );
};

export default theme.withStyles(CrossFadeIcon,{displayName:"CrossFadeIconComponent",mode:'normal'});

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

CrossFadeIcon.propTypes = {
    /**
   * Icon to display for the `CrossFadeIcon`.
   */
  source: PropTypes.oneOfType([
     PropTypes.string,
     PropTypes.object,
  ]),
  /**
   * Color of the icon.
   */
  color: PropTypes.string,
  /**
   * Size of the icon.
   */
  size: PropTypes.number,
}