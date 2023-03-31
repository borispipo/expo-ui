
import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { Animated, I18nManager,Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import ScrollView  from "$ecomponents/ScrollView";
import theme from "$theme";
import DefaultControls from './Controls';
import {defaultObj,defaultDecimal} from "$cutils";
import {isNativeMobile} from "$cplatform";
const isNative = isNativeMobile();
import { ActivityIndicator } from 'react-native-paper';

const WIDTH_HEIGHT = 250;

const useNativeDriver = false; // because of RN #13377

class SwiperComponent extends React.Component {
  children = (() => React.Children.toArray(this.props.children))();
  count = (() => this.children.length)();

  startAutoplay() {
    const { timeout } = this.props;
    this.stopAutoplay();
    if (timeout) {
      this.autoplay = setTimeout(
        this._autoplayTimeout,
        Math.abs(timeout) * 1000
      );
    }
  }

  stopAutoplay() {
    this.autoplay && clearTimeout(this.autoplay);
  }

  goToNext() {
    this._goToNeighboring();
  }

  goToPrev() {
    this._goToNeighboring(true);
  }

  goTo(index = 0) {
    const delta = index - this.getActiveIndex();
    if (delta) {
      this._fixAndGo(delta);
    }
  }

  getActiveIndex() {
    return this.state.activeIndex;
  }

  // stop public methods

  _autoplayTimeout() {
    const { timeout } = this.props;
    this._goToNeighboring(timeout < 0);
  }

  _goToNeighboring(toPrev = false) {
    this._fixAndGo(toPrev ? -1 : 1);
  }

  constructor(props) {
    super(props);

    this._autoplayTimeout = this._autoplayTimeout.bind(this);
    this._onLayout = this._onLayout.bind(this);
    this._fixState = this._fixState.bind(this);

    this.goToPrev = this.goToPrev.bind(this);
    this.goToNext = this.goToNext.bind(this);
    this.goTo = this.goTo.bind(this);

    this.state = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      activeIndex: props.activeIndex,
      pan: new Animated.ValueXY(),
    };

    this._animatedValueX = 0;
    this._animatedValueY = 0;

    this._panResponder = PanResponder.create(this._getPanResponderCallbacks());
  }

  componentDidMount() {
    this.state.pan.x.addListener(({ value }) => (this._animatedValueX = value));
    this.state.pan.y.addListener(({ value }) => (this._animatedValueY = value));
    this.startAutoplay();
  }

  componentWillUnmount() {
    this.stopAutoplay();
    this.state.pan.x.removeAllListeners();
    this.state.pan.y.removeAllListeners();
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    this.children = (() => React.Children.toArray(nextProps.children))();
    this.count = (() => this.children.length)();
    if(typeof nextProps.activeIndex =='number' && nextProps.activeIndex !== this.state.activeIndex){
      this.setState({activeIndex:nextProps.activeIndex},()=>{
        this._fixState();
      })
    }
  }

  _getPanResponderCallbacks() {
    return {
      onPanResponderTerminationRequest: () => false,
      onMoveShouldSetResponderCapture: () => true,
      /***
       * Disable panResponder on chidld of vie
       * @see : https://stackoverflow.com/questions/45810262/how-to-disable-panresponder-on-child-component-react-native 
       * 
      */
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        const { gesturesEnabled, vertical, minDistanceToCapture } = this.props;

        if (!gesturesEnabled()) {
          return false;
        }

        this.props.onAnimationStart &&
          this.props.onAnimationStart(this.getActiveIndex());

        const allow =
          Math.abs(vertical ? gestureState.dy : gestureState.dx) >
          minDistanceToCapture;

        if (allow) {
          this.stopAutoplay();
        }

        return allow;
      },
      onPanResponderGrant: () => this._fixState(),
      onPanResponderMove: Animated.event([
        null,
        this.props.vertical
          ? { dy: this.state.pan.y }
          : { dx: this.state.pan.x },
      ], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        const { vertical, minDistanceForAction } = this.props;
        const { width, height } = this.state;

        this.startAutoplay();

        const correction = vertical
          ? gesture.moveY - gesture.y0
          : gesture.moveX - gesture.x0;

        if (
          Math.abs(correction) <
          (vertical ? height : width) * minDistanceForAction
        ) {
          this._spring({ x: 0, y: 0 });
        } else {
          this._changeIndex(correction > 0 ? (!vertical && I18nManager.isRTL ? 1 : -1) : (!vertical && I18nManager.isRTL ? -1 : 1));
        }
      },
    };
  }

  _spring(toValue) {
    const { springConfig, onAnimationEnd } = this.props;
    const { activeIndex } = this.state;
    Animated.spring(this.state.pan, {
      ...springConfig,
      toValue,
      useNativeDriver, // false, see top of file
    }).start(() => onAnimationEnd && onAnimationEnd(activeIndex));
  }

  _fixState() {
    const { vertical } = this.props;
    const { width, height, activeIndex } = this.state;
    this._animatedValueX = vertical ? 0 : width * activeIndex * (I18nManager.isRTL ? 1 : -1);
    this._animatedValueY = vertical ? height * activeIndex * -1 : 0;
    this.state.pan.setOffset({
      x: this._animatedValueX,
      y: this._animatedValueY,
    });
    this.state.pan.setValue({ x: 0, y: 0 });
  }

  _fixAndGo(delta) {
    this._fixState();
    this.props.onAnimationStart &&
      this.props.onAnimationStart(this.getActiveIndex());
    this._changeIndex(delta);
  }

  _changeIndex(delta = 1,callOnChange) {
    const { loop, vertical } = this.props;
    const { width, height, activeIndex } = this.state;

    let toValue = { x: 0, y: 0 };
    let skipChanges = !delta;
    let calcDelta = delta;

    if (activeIndex <= 0 && delta < 0) {
      skipChanges = !loop;
      calcDelta = this.count + delta;
    } else if (activeIndex + 1 >= this.count && delta > 0) {
      skipChanges = !loop;
      calcDelta = -1 * activeIndex + delta - 1;
    }

    if (skipChanges) {
      return this._spring(toValue);
    }

    this.stopAutoplay();

    let index = activeIndex + calcDelta;
    this.setState({ activeIndex: index });

    if (vertical) {
      toValue.y = height * -1 * calcDelta;
    } else {
      toValue.x = width * (I18nManager.isRTL ? 1 : -1) * calcDelta;
    }
    this._spring(toValue);

    this.startAutoplay();
    if(callOnChange !== false && this.props.onIndexChanged){
      this.props.onIndexChanged(index);
    }
  }
  evaluateHeight(){
    
  }
  _onLayout({
    nativeEvent: {
      layout: { x, y, width:layoutWidth, height:layoutHeight,left,top },
    },
  }) {
    const {width:winWidth,height:winHeight} = Dimensions.get("window");
    left = defaultDecimal(left,x);
    top = defaultDecimal(top,y);
    let width = winWidth - left
    if(layoutWidth >= WIDTH_HEIGHT){
        width = layoutWidth
    } else {
       width = Math.max(WIDTH_HEIGHT,width)
    }
    const height = Math.max(winHeight - top,WIDTH_HEIGHT,layoutHeight);
    this.setState({ x, y, width,left,top, height }, () => this._fixState());
  }

  render() {
    let {
      loop,
      vertical,
      positionFixed,
      containerProps,
      contentContainerProps,
      swipeAreaProps,
      contentProps,
      withScrollView,
      childrenProps,
      testID,
      scrollViewProps,
      controlsEnabled,
      controlsProps,
      Controls = DefaultControls,
      placeHolder,
    } = this.props;
    const { pan, x, y, width, height:customHeight } = this.state;
    containerProps = defaultObj(containerProps);
    contentContainerProps = defaultObj(contentContainerProps);
    swipeAreaProps = defaultObj(swipeAreaProps);
    contentProps = defaultObj(contentProps);
    withScrollView = typeof withScrollView ==='boolean'? withScrollView : false;
    const Wrapper = withScrollView ? ScrollView : React.Fragment;
    const wrapperProps = withScrollView  ? Object.assign({},scrollViewProps) : {};
    testID = defaultStr(testID,'RN_SwiperComponent');
    childrenProps = Array.isArray(childrenProps)? childrenProps : [];
    const isReady = customHeight > 40 ? true : false;
    const height = !isReady ? WIDTH_HEIGHT : customHeight;
    if(withScrollView){
      wrapperProps.nestedScrollEnabled = typeof wrapperProps.nestedScrollEnabled ==="boolean"? wrapperProps.nestedScrollEnabled : isNative;
      if(typeof wrapperProps.showsVerticalScrollIndicator !=='boolean'){
        wrapperProps.showsVerticalScrollIndicator = !isNative;
      }
      wrapperProps.contentContainerStyle = [styles.scrollViewContentContainer,wrapperProps.contentContainerStyle,isNativeMobile()?{flexGrow: 0,flex:0}:{flex:1,flexGrow:1}]
    }
    
    const Placeholder = placeHolder;
    const activeIndex = this.getActiveIndex();
    return (
      <View
        testID = {testID+"_Container"}
        {...containerProps}
        style={StyleSheet.flatten([styles.root, containerProps.style])}
        onLayout={this._onLayout}
      >
        {!isReady ? (
            React.isComponent(Placeholder)? <Placeholder testID={testID+'_Preloader'}/> : 
            React.isValidElement(placeHolder)? placeHolder :
            <View testID={testID+'_PreloaderContainer'} style = {styles.preloaderContainer}>
              {<ActivityIndicator testID={testID+"_Preloader"} size={'large'}/>}
            </View> 
          ) : null}
        <View
          testID={testID+"_ContentContainer"}
          {...contentContainerProps}
          style={[styles.container(positionFixed, x, y, width, height),contentContainerProps.style]}
        >
          <Animated.View
            testID={testID+"_AnimatedContent"}
            style={[
              styles.swipeArea(vertical, this.count, width, height),
              swipeAreaProps.style,
              {
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
              },
            ]}
            {...this._panResponder.panHandlers}
          >
            {this.children.map((el, i) => {
              const childProps = isObj(childrenProps[i])? childrenProps [i] : {};
              const hasScroll = childProps.withScrollView !== false ? withScrollView : false;
              const W =  hasScroll? Wrapper:React.Fragment,wProps = hasScroll ? {...wrapperProps,testID:testID+"_ScrollView"+i} : {};
              return (
                <View
                  key={i}
                  {...contentProps}
                  testID={testID+"_ContentContainerContent_"+i}
                  {...childProps}
                  style={[
                    childProps.style,
                    contentProps.style,
                    {width, height,maxHeight:height},
                  ]}
                >
                  <W {...wProps}>
                    {el}                
                  </W>
                </View>
              );
            })}
          </Animated.View>
          {controlsEnabled && (
            <Controls
              testID={testID+"_Controls"}
              {...controlsProps}
              theme={theme}
              vertical={vertical}
              count={this.count}
              activeIndex={activeIndex}
              isFirst={!loop && !activeIndex}
              isLast={!loop && activeIndex + 1 >= this.count}
              goToPrev={this.goToPrev}
              goToNext={this.goToNext}
              goTo={this.goTo}
            />
          )}
        </View>
      </View>
    );
  }
}

SwiperComponent.propTypes = {
  vertical: PropTypes.bool,
  activeIndex: PropTypes.number,
  loop: PropTypes.bool,
  timeout: PropTypes.number,
  gesturesEnabled: PropTypes.func,
  withScrollView : PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.func,
  ]),
  placeholder : PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.element
  ]),
  springConfig: PropTypes.object,
  minDistanceToCapture: PropTypes.number, // inside ScrollView
  minDistanceForAction: PropTypes.number,
  /***
   * 
    if a parent View wants to prevent the child from becoming responder on a touch start, it should have a onStartShouldSetResponderCapture handler which returns true.
   * @see : https://stackoverflow.com/questions/45810262/how-to-disable-panresponder-on-child-component-react-native
   */
  stopChildrenEventPropagation : PropTypes.bool,
  onAnimationStart: PropTypes.func,
  onAnimationEnd: PropTypes.func,
  onIndexChanged: PropTypes.func,

  positionFixed: PropTypes.bool, // Fix safari vertical bounces
  containerProps: PropTypes.shape({
    style: PropTypes.any,
  }),
  contentContainerProps: PropTypes.shape({
    style: PropTypes.any,
  }),
  swipeAreaProps: PropTypes.shape({
    style: PropTypes.any,
  }),
  contentProps: PropTypes.shape({
    style: PropTypes.any,
  }),

  controlsEnabled: PropTypes.bool,
  controlsProps: PropTypes.shape(DefaultControls.propTypes),
  Controls: PropTypes.func,

  theme: PropTypes.object,
};

SwiperComponent.defaultProps = {
  vertical: false,
  activeIndex: 0,
  loop: false,
  timeout: 0,
  withScrollView : true,
  gesturesEnabled: () => true,
  minDistanceToCapture: 5,
  minDistanceForAction: 0.2,
  positionFixed: false,
  controlsEnabled: false,
};

const styles = {
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Fix web vertical scaling (like expo v33-34)
  container: (positionFixed, x, y, width, height) => ({
    backgroundColor: 'transparent',
    // Fix safari vertical bounces
    position: positionFixed ? 'fixed' : 'relative',
    overflow: 'hidden',
    flexGrow: 1,
    top: positionFixed ? y : 0,
    left: positionFixed ? x : 0,
    width,
    height,
    justifyContent: 'flex-start',
    alignItems : 'flex-start',
  }),
  swipeArea: (vertical, count, width, height) => ({
    position: 'relative',
    top: 0,
    left: 0,
    width:vertical ? width : width * count,
    height:vertical ? height * count : height,
    flexDirection: vertical ? 'column' : 'row',
  }),
  scrollViewContentContainer : {
    paddingBottom : 40,
    flex : 1,
  },
  preloaderContainer : {
    flex : 1,
    marginVertical : 50,
    justifyContent : 'center',
    alignItems : 'center',
  }
};

export default SwiperComponent;