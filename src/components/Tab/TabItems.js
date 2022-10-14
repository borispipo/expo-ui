import React from '$react';
import View from "$ecomponents/View";
import {
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import ScrollView  from "$ecomponents/ScrollView";
import PropTypes from "prop-types";
import theme,{StylePropTypes,Colors} from "$theme";
import {isMobileNative,isMobileBrowser} from "$cplatfrom"
import {defaultStr} from "$utils";
import {Elevations} from "$ecomponents/Surface";

const showScrollBarIndicator = !isMobileBrowser() && !isMobileNative();

import TabItem from "./TabItem";

const TabItemsComponent = ({
  children,
  activeIndex,
  scrollable = true,
  onChange = () => {},
  indicatorProps,
  disableIndicator,
  removeShadow,
  elevation = 7,
  fixed = false,
  testID,
  scrollViewProps,
  ...rest
}) => {
  const backgroundColor = theme.isDark()? theme.colors.surface : theme.colors.primary;
  indicatorProps = defaultObj(indicatorProps);
  const indicatorStyle = Object.assign({},StyleSheet.flatten(indicatorProps.style));
  indicatorStyle.backgroundColor = Colors.isValid(indicatorStyle.backgroundColor)? indicatorStyle.backgroundColor : theme.colors.secondary;
  const animationRef = React.useRef(new Animated.Value(0));
  const scrollViewRef = React.useRef(null);
  const scrollViewPosition = React.useRef(0);

  const tabItemsPosition = React.useRef([]);
  const [tabContainerWidth,setTabContainerWidth] = React.useState(0);

  const scrollHandler = React.useCallback(() => {
    if (tabItemsPosition.current.length > activeIndex) {
      let itemStartPosition =
        activeIndex === 0 ? 0 : tabItemsPosition.current[activeIndex - 1].position;
      let itemEndPosition = tabItemsPosition.current[activeIndex].position;

      const scrollCurrentPosition = scrollViewPosition.current;
      const tabContainerCurrentWidth = tabContainerWidth;

      let scrollX = scrollCurrentPosition;

      if (itemStartPosition < scrollCurrentPosition) {
        scrollX += itemStartPosition - scrollCurrentPosition;
      } else if (
        scrollCurrentPosition + tabContainerCurrentWidth <
        itemEndPosition
      ) {
        scrollX +=
          itemEndPosition - (scrollCurrentPosition + tabContainerCurrentWidth);
      }
      scrollViewRef.current?.scrollTo({
        x: scrollX,
        y: 0,
        animated: true,
      });
    }
  }, [tabContainerWidth, activeIndex]);

  React.useEffect(() => {
    Animated.timing(animationRef.current, {
      toValue: activeIndex ,
      useNativeDriver: true,
      duration: 170,
    }).start();
    scrollable && requestAnimationFrame(scrollHandler);
  }, [animationRef, scrollHandler, activeIndex, scrollable]);

  const onScrollHandler = React.useCallback((event) => {
    scrollViewPosition.current = event.nativeEvent.contentOffset.x;
  }, []);

  const activeIndicatorLayout = tabItemsPosition.current[activeIndex];
  const WIDTH = activeIndicatorLayout?.width;
  const getLeftPosition = React.useCallback(()=>{
    let left = 0;
    for(let i =0; i< activeIndex;i++){
      if(isObj(tabItemsPosition.current[i]) && typeof tabItemsPosition.current[i].width =='number'){
        left+= tabItemsPosition.current[i].width;
        }
    }
    return left;
  },[activeIndex])
  indicatorStyle.left = getLeftPosition();
  testID = defaultStr(testID,"RNE_TabComponent");
  scrollViewProps = defaultObj(scrollViewProps)
  return (<View
      {...rest}
      testID = {testID}
      style={[
        elevation && Elevations[elevation],
        {
          backgroundColor,
        },
        styles.viewStyle,
        rest.style,
      ]}
      onLayout={({ nativeEvent: { layout } }) => {
        setTabContainerWidth(layout.width);
      }}
  >
    <ScrollView 
      {...scrollViewProps}
      showsHorizontalScrollIndicator = {showScrollBarIndicator} 
      scrollEventThrottle = {0} 
      horizontal 
      ref={scrollViewRef} 
      testID={testID+"_ScrollView"} 
      onScroll={onScrollHandler}
    >
      {React.Children.map(children, (child, index) => {
            const active = index === activeIndex?true : false;
            return React.cloneElement(
              child,
              {
                onPress: () => {
                  onChange(index);
                },
                onLayout: (event) => {
                  const { width } = event.nativeEvent.layout;
                  const previousItemPosition =
                    tabItemsPosition.current[index - 1]?.position || 0;

                  tabItemsPosition.current[index] = {
                    position: previousItemPosition + width,
                    width,
                  };
                },
                activeIndex,
                index,
                active,
                testID : testID+'_Children_'+index
              }
            );
          })}
          {!disableIndicator && (
              <Animated.View
                {...indicatorProps}
                testID={testID+'_Indicator'}
                style={[
                  styles.indicator,
                  {
                    width: WIDTH,
                  },
                  indicatorStyle,
                ]}
              />
          )}
    </ScrollView>
    <Animated.View
      testID={testID+"_Shadow"}
      style={[
        styles.removeTopShadow,
        {
          height: elevation,
          backgroundColor,
          top: -elevation,
        },
      ]}
    />
  </View>);
};

const styles = StyleSheet.create({
  relative : {
    position : 'relative'
  },
  buttonStyle: {
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  titleStyle: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    textTransform: 'uppercase',
  },
  viewStyle: {
    flexDirection: 'row',
    position: 'relative',
    maxWidth : '100%',
    minHeight : 50,
  },
  indicator: {
    display: 'flex',
    position: 'absolute',
    height: 4,
    bottom: 0,
    width : '100%',
    ...Platform.select({
      web: {
        backgroundColor: 'transparent',
        transitionDuration: '150ms',
        transitionProperty: 'all',
        transformOrigin: 'left',
        willChange: 'transform',
      },
      default: {},
    }),
  },
  removeTopShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
  fixedContentContainerStyle: {
    flex: 1,
  },
});

TabItemsComponent.displayName = 'TabComponent.Items';

TabItemsComponent.propTypes = {
    /** Child position index activeIndex. */
    activeIndex : PropTypes.number,
  
    /** Makes Tab Scrolling */
    scrollable : PropTypes.bool,
  
    /** On Index Change Callback. */
    onChange : PropTypes.func,
  
    /** Disable the indicator below. */
    disableIndicator : PropTypes.bool,

    /** Additional styling for tab indicator. */
    indicatorProps : PropTypes.object,
  
    fixed : PropTypes.bool, //si les tabs items seronts fixes
  }

  export default TabItemsComponent

  TabItemsComponent.Item = TabItem;