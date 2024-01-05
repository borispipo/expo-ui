import React, {Component} from '$react';
import {isObj,defaultStr} from "$cutils";
import View from "$ecomponents/View";
import { Portal } from 'react-native-paper';
import theme,{Colors} from "$theme";
import {
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
  PanResponder,
  Keyboard,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';
import Label from "$ecomponents/Label";
import {
  DEFAULT_IMAGE_DIMENSIONS,
  IS_ANDROID,
  IS_IOS_BELOW_11,
  TYPE,
  ACTION,
  HEIGHT,
  getDefaultStatusBarStyle,
  getDefaultStatusBarBackgroundColor,
} from './Utils';
import Queue from './Queue';

const compareQueues = (a,b)=>{
  return isObj(a) && isObj(b) && (a.title || b.title) && a.title === b.title && a.message == b.message ? true : false;
}

const BOTTOM = 50;
const TOP = 50;


export default class DropdownAlert extends Component {
  static propTypes = {
    imageSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    infoImageSrc: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    warnImageSrc: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    errorImageSrc: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    successImageSrc: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    cancelBtnImageSrc: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    infoColor: PropTypes.string,
    warnColor: PropTypes.string,
    errorColor: PropTypes.string,
    successColor: PropTypes.string,
    closeInterval: PropTypes.number,
    startDelta: PropTypes.number,
    endDelta: PropTypes.number,
    wrapperStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    contentContainerStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
    titleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    messageStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    imageStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    cancelBtnImageStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
    titleNumberOfLines: PropTypes.number,
    messageNumberOfLines: PropTypes.number,
    onClose: PropTypes.func,
    onCancel: PropTypes.func,
    showCancel: PropTypes.bool,
    tapToCloseEnabled: PropTypes.bool,
    panResponderEnabled: PropTypes.bool,
    translucent: PropTypes.bool,
    useNativeDriver: PropTypes.bool,
    isInteraction: PropTypes.bool,
    activeStatusBarStyle: PropTypes.string,
    activeStatusBarBackgroundColor: PropTypes.string,
    inactiveStatusBarStyle: PropTypes.string,
    inactiveStatusBarBackgroundColor: PropTypes.string,
    elevation: PropTypes.number,
    zIndex: PropTypes.number,
    sensitivity: PropTypes.number,
    defaultContainer: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    defaultTextContainer: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
    renderImage: PropTypes.func,
    renderCancel: PropTypes.func,
    renderTitle: PropTypes.func,
    renderMessage: PropTypes.func,
    testID: PropTypes.string,
    accessible: PropTypes.bool,
    titleTextProps: PropTypes.object,
    messageTextProps: PropTypes.object,
    onTap: PropTypes.func,
  };
  static defaultProps = {
    onClose: () => {},
    onCancel: () => {},
    closeInterval: 4000,
    startDelta: -100,
    endDelta: 0,
    titleNumberOfLines: 2,
    messageNumberOfLines: 10,
    imageSrc: null,
    infoImageSrc: require('./assets/info.png'),
    warnImageSrc: require('./assets/warn.png'),
    errorImageSrc: require('./assets/error.png'),
    successImageSrc: require('./assets/success.png'),
    cancelBtnImageSrc: require('./assets/cancel.png'),
    /*infoColor: '#2B73B6',
    warnColor: '#cd853f',
    errorColor: '#cc3232',
    successColor: '#32A54A',*/
    showCancel: false,
    tapToCloseEnabled: true,
    panResponderEnabled: true,
    wrapperStyle: null,
    containerStyle: {
      flexDirection: 'row',
      backgroundColor: '#202020',
    },
    contentContainerStyle: {
      flex: 1,
      flexDirection: 'row',
    },
    titleStyle: {
      fontSize: 16,
      textAlign: 'left',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: 'transparent',
    },
    messageStyle: {
      fontSize: 14,
      textAlign: 'left',
      fontWeight: 'normal',
      color: 'white',
      backgroundColor: 'transparent',
    },
    imageStyle: {
      width: DEFAULT_IMAGE_DIMENSIONS,
      height: DEFAULT_IMAGE_DIMENSIONS,
      alignSelf: 'center',
    },
    cancelBtnImageStyle: {
      width: DEFAULT_IMAGE_DIMENSIONS,
      height: DEFAULT_IMAGE_DIMENSIONS,
    },
    cancelBtnStyle: {
      alignSelf: 'center',
    },
    defaultContainer: {
      flexDirection: 'row',
      marginHorizontal : 15,
      flexGrow : 1,
      alignSelf : 'flex-end',
      padding: 8,
    },
    defaultTextContainer: {
      flex: 1,
      paddingHorizontal: 8,
    },
    translucent: false,
    activeStatusBarStyle: 'light-content',
    activeStatusBarBackgroundColor: getDefaultStatusBarBackgroundColor(),
    inactiveStatusBarStyle: getDefaultStatusBarStyle(),
    inactiveStatusBarBackgroundColor: getDefaultStatusBarBackgroundColor(),
    isInteraction: true,
    useNativeDriver: true,
    elevation: 1,
    zIndex: null,
    sensitivity: 20,
    renderImage: undefined,
    renderCancel: undefined,
    renderTitle: undefined,
    renderMessage: undefined,
    testID: undefined,
    accessible: false,
    titleTextProps: undefined,
    messageTextProps: undefined,
    onTap: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      animationValue: new Animated.Value(0),
      isOpen: false,
      bottomValue: BOTTOM,
      height: 0,
    };
    this.alertData = {
      type: '',
      message: '',
      title: '',
      payload: {},
      interval: props.closeInterval,
      action: '',
    };
    this.panResponder = this.getPanResponder();
    Object.defineProperties(this,{
        keyboardEvents : {value : {
          show : Keyboard.addListener(
            'keyboardDidShow',() => {
                this.__isKeyboardOpen = true;
            }
          ),
          hide : Keyboard.addListener(
            'keyboardDidHide',() => {
               this.__isKeyboardOpen = false;
            }
          )
       }}
    })
    this.queue = new Queue();
  }
  isKeyboardOpen(){
     return this.__isKeyboardOpen;
  }
  componentWillUnmount() {
    if (this.state.isOpen) {
      this.closeAction(ACTION.programmatic);
    }
    Object.map(this.keyboardEvents,(ev)=>{
       if(ev && ev.remove){
          ev.remove();
       }
    })
  }
  getPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) =>
        this._onShouldStartPan(event, gestureState),
      onMoveShouldSetPanResponder: (event, gestureState) =>
        this._onShouldMovePan(event, gestureState),
      onPanResponderMove: (event, gestureState) =>
        this._onMovePan(event, gestureState),
      onPanResponderRelease: (event, gestureState) =>
        this._onDonePan(event, gestureState),
      onPanResponderTerminate: (event, gestureState) =>
        this._onDonePan(event, gestureState),
    });
  };
  _onShouldStartPan = () => {
    return this.props.panResponderEnabled;
  };
  _onShouldMovePan = (event, gestureState) => {
    const {sensitivity, panResponderEnabled} = this.props;
    const dx = Math.abs(gestureState.dx);
    const dy = Math.abs(gestureState.dy);
    const isDxSensitivity = dx < sensitivity;
    const isDySensitivity = dy >= sensitivity;
    return isDxSensitivity && isDySensitivity && panResponderEnabled;
  };
  _onMovePan = (event, gestureState) => {
    if (gestureState.dy < 0) {
      this.setState({bottomValue: gestureState.dy});
    }
  };
  _onDonePan = (event, gestureState) => {
    const start = this.getStartDelta(this.state.height, this.props.startDelta);
    const delta = start / 5;
    if (gestureState.dy < delta) {
      this.closeAction(ACTION.pan);
    }
  };
  getStringValue = (value) => {
    try {
      if (typeof value !== 'string') {
        if (Array.isArray(value)) {
          return value.join(' ');
        }
        if (typeof value === 'object') {
          return `${JSON.stringify(value)}`;
        }
        return `${value}`;
      }
      return value;
    } catch (error) {
      return error.toString();
    }
  };
  alertWithType = async ({
    type = '',
    title = '',
    message = '',
    payload = {},
    interval,
    ...rest
  }) => {
    // type is not validated so unexpected types will render alert with default styles.
    // these default styles can be overridden with style props. (for example, containerStyle)
    const {closeInterval} = this.props;
    // title and message are converted to strings
    const data = {
      ...rest,
      type,
      title: this.getStringValue(title),
      message: this.getStringValue(message),
      payload,
      interval: closeInterval,
    };
    //previous queue data are same to new so do nothing
    if(compareQueues(data,this.queue.firstItem)){
      return;
    }
    // closeInterval prop is overridden if interval is provided
    if (interval && typeof interval === 'number') {
      data.interval = interval;
    }
    this.queue.enqueue(data);
    // start processing queue when it has at least one
    if (this.getQueueSize() === 1) {
      this._processQueue();
    }
  };
  clearQueue = () => {
    this.queue.clear();
  };
  getQueueSize = () => {
    return this.queue.size;
  };
  _processQueue = () => {
    const data = this.queue.firstItem;
    if(data && this.activeData){
        if(data.type == this.activeData.type && React.getTextContent(data.title) == React.getTextContent(this.activeData.title) && React.getTextContent(data.message) == React.getTextContent(this.activeData.message)){
            this.queue.dequeue();
            return this._processQueue();
        }
    }
    this.activeData = data;
    if (data) {
      this.open(data);
    }
  };
  open = (data = {}) => {
    this.activeData = data;
    this.alertData = data;
    const position = data.top || this.isKeyboardOpen() ? "top" : data.position;
    this.setState({isOpen: true,position},()=>{
      this.animate(1, 450, () => {
        if (data.interval > 0) {
          this.closeAutomatic(data.interval);
        }
      });
    });
    
  };
  closeAction = (action = ACTION.programmatic, onDone = () => {}) => {
    // action is how the alert was closed.
    // alert currently closes itself by:
    // tap, pan, cancel, programmatic or automatic
    if (this.state.isOpen) {
      this.clearCloseTimeoutID();
      this.close(action, onDone);
    }
  };
  closeAutomatic = (interval) => {
    this.clearCloseTimeoutID();
    this.closeTimeoutID = setTimeout(() => {
      this.close(ACTION.automatic);
    }, interval);
  };
  close = (action, onDone = () => {}) => {
    this.animate(0, 250, () => {
      const {onClose, onCancel, onTap} = this.props;
      this.alertData.action = action;
      const latest = this.queue.dequeue();
      if (action === ACTION.cancel) {
        onCancel(this.alertData);
      } else {
        if (action === ACTION.tap) {
          onTap(this.alertData);
        }
        onClose(this.alertData);
        if(typeof latest?.onClose ==="function"){
          latest?.onClose(latest);
        }
      }
      this.setState({isOpen: false, bottomValue: BOTTOM, height: 0});
      this._processQueue();
      onDone();
    });
  };
  clearCloseTimeoutID = () => {
    if (this.closeTimeoutID) {
      clearTimeout(this.closeTimeoutID);
    }
  };
  animate = (toValue, duration = 450, onComplete = () => {}) => {
    const {useNativeDriver, isInteraction} = this.props;
    Animated.spring(this.state.animationValue, {
      toValue: toValue,
      duration: duration,
      friction: 9,
      useNativeDriver,
      isInteraction,
    }).start(onComplete);
  };
  getStartDelta = (height, start) => {
    const windowHeight = HEIGHT;
    const startMin = 0 - height;
    const startMax = windowHeight + height;
    if (start < 0 && start !== startMin) {
      return startMin;
    } else if (start > startMax) {
      return startMax;
    }
    return start;
  };
  getEndDelta = (height, end) => {
    const windowHeight = HEIGHT;
    const endMin = 0;
    const endMax = windowHeight;
    if (end < endMin) {
      return endMin;
    } else if (end >= endMax) {
      return endMax - height;
    }
    return end;
  };
  getOutputRange = (height, startDelta, endDelta) => {
    if (!height) {
      return [startDelta, endDelta];
    }
    const start = this.getStartDelta(height, startDelta);
    const end = this.getEndDelta(height, endDelta);
    return [start, end];
  };
  getInfoColor(){
    return Colors.isValid(this.props.infoColor)? this.props.infoColor : theme.colors.info || '#2B73B6';
  }
  getSuccessColor(){
    return Colors.isValid(this.props.successColor)? this.props.successColor : theme.colors.success || '#32A54A';
  }
  getWarnColor(){
    return Colors.isValid(this.props.warnColor)? this.props.warnColor : theme.colors.warning || '#cd853f';
  }
  getErrorColor(){
    return Colors.isValid(this.props.errorColor)? this.props.errorColor : theme.colors.error || '#cc3232';
  }
  getStyleForType = (type) => {
    const {defaultContainer} = this.props;
    switch (type) {
      case TYPE.info:
        return [
          StyleSheet.flatten(defaultContainer),
          {backgroundColor: this.getInfoColor()},
        ];
      case TYPE.warn:
        return [
          StyleSheet.flatten(defaultContainer),
          {backgroundColor: this.getWarnColor()},
        ];
      case TYPE.error:
        return [
          StyleSheet.flatten(defaultContainer),
          {backgroundColor: this.getErrorColor()},
        ];
      case TYPE.success:
        return [
          StyleSheet.flatten(defaultContainer),
          {backgroundColor: this.getSuccessColor()},
        ];
      default:
        return [
          StyleSheet.flatten(defaultContainer),
          StyleSheet.flatten(this.props.containerStyle),
        ];
    }
  };
  getSourceForType = (type) => {
    switch (type) {
      case TYPE.info:
        return this.props.infoImageSrc;
      case TYPE.warn:
        return this.props.warnImageSrc;
      case TYPE.error:
        return this.props.errorImageSrc;
      case TYPE.success:
        return this.props.successImageSrc;
      default:
        return this.props.imageSrc;
    }
  };
  getBackgroundColorForType = (type) => {
    switch (type) {
      case TYPE.info:
        return this.getInfoColor();
      case TYPE.warn:
        return this.getWarnColor();
      case TYPE.error:
        return this.getErrorColor();
      case TYPE.success:
        return this.getSuccessColor();
      default:
        return this.props.containerStyle.backgroundColor;
    }
  };
  _onLayoutEvent = (event) => {
    const {height} = event.nativeEvent.layout;
    if (height > this.state.height) {
      const {startDelta, endDelta} = this.props;
      const start = this.getStartDelta(height, startDelta);
      const end = this.getEndDelta(height, endDelta);
      if (startDelta !== start || endDelta !== end) {
        this.setState({height});
      }
    }
  };
  _renderImage = (source, imageStyle) => {
    const {renderImage} = this.props;
    if (renderImage) {
      return renderImage(this.props, this.alertData);
    }
    if (!source) {
      return null;
    }
    let style = imageStyle;
    if (!style.width) {
      style.width = DEFAULT_IMAGE_DIMENSIONS;
    }
    if (!style.height) {
      style.height = DEFAULT_IMAGE_DIMENSIONS;
    }
    const isRemote = typeof source === 'string';
    const src = isRemote ? {uri: source} : source;
    return <Image style={style} source={src} />;
  };
  _renderTitle = () => {
    if (this.props.renderTitle) {
      return this.props.renderTitle(this.props, this.alertData);
    }
    const {titleTextProps, titleStyle, titleNumberOfLines} = this.props;
    return (
      <Label
        {...titleTextProps}
        style={titleStyle}
        numberOfLines={titleNumberOfLines}>
        {this.alertData.title}
      </Label>
    );
  };
  _renderMessage = () => {
    if (this.props.renderMessage) {
      return this.props.renderMessage(this.props, this.alertData);
    }
    const {messageTextProps, messageStyle, messageNumberOfLines} = this.props;
    return (
      <Label
        {...messageTextProps}
        style={messageStyle}
        numberOfLines={messageNumberOfLines}>
        {this.alertData.message}
      </Label>
    );
  };
  _renderCancel = (show = false) => {
    if (!show) {
      return null;
    }
    const {
      renderCancel,
      cancelBtnStyle,
      cancelBtnImageSrc,
      cancelBtnImageStyle,
    } = this.props;
    if (renderCancel) {
      return renderCancel(this.props, this.alertData);
    }
    return (
      <Pressable
        style={cancelBtnStyle}
        onPress={() => this.closeAction(ACTION.cancel)}>
        {this._renderImage(cancelBtnImageSrc, cancelBtnImageStyle)}
      </Pressable>
    );
  };
  render() {
    const {isOpen} = this.state;
    if (!isOpen) {
      return null;
    }
    const {
      elevation,
      zIndex,
      wrapperStyle,
      tapToCloseEnabled,
      testID:customTestId,
      accessible,
      contentContainerStyle,
      defaultTextContainer,
      startDelta,
      endDelta,
      translucent,
      showCancel,
      imageStyle,
    } = this.props;
    const testID = defaultStr(customTestId,"RN_DropdownAlert");
    const {animationValue, bottomValue, height} = this.state;
    const {type, payload} = this.alertData;
    let style = this.getStyleForType(type);
    let imageSrc = this.getSourceForType(type);
    if (
      payload &&
      payload.hasOwnProperty('source') &&
      payload.source &&
      typeof payload.source !== 'object'
    ) {
      imageSrc = payload.source;
    }
    if (IS_ANDROID && translucent) {
      style = [style, {paddingTop: StatusBar.currentHeight}];
    }
    const outputRange = this.getOutputRange(height, startDelta, endDelta);
    const position = defaultStr(this.state.position).toLowerCase();
    const isTopPosition = position ==='top';
    const wrapperAnimStyle = {
      transform: [
        {
          translateY: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange,
          }),
        },
      ],
      position: "absolute",
      [isTopPosition? 'top':'bottom']: isTopPosition ? TOP : bottomValue,
      left: 0,
      right: 0,
      elevation: elevation,
    };
    const activeOpacity = !tapToCloseEnabled || showCancel ? 1 : 0.95;
    const onPress = !tapToCloseEnabled
      ? null
      : () => this.closeAction(ACTION.tap);
    return (
      <Portal>
          <Animated.View
            ref={(ref) => (this.mainView = ref)}
            {...this.panResponder.panHandlers}
            testID={testID+"_AnimatedView"}
            style={[wrapperAnimStyle, wrapperStyle]}>
            <Pressable
              activeOpacity={activeOpacity}
              onPress={onPress}
              disabled={!tapToCloseEnabled}
              onLayout={(event) => this._onLayoutEvent(event)}
              testID={testID}
              accessible={accessible}>
            <View style={style} testID={testID+"_ContentContainer"}>
                  <View testID={testID+"_ContentWrapper"} style={[contentContainerStyle]}
                     mediaQueryUpdateStyle={({isMobile,isTablet,width})=>{
                       return {
                          maxWidth  : isMobile ? (90*width)/100 : isTablet? Math.max((70*width/100),350) : 500
                       }
                    }}
                  >
                      {this._renderImage(imageSrc, imageStyle)}
                      <View testID={testID+"_Content"} style={defaultTextContainer}>
                          {this._renderTitle()}
                          {this._renderMessage()}
                      </View>
                      {this._renderCancel(showCancel)}
                </View>
            </View>
            </Pressable>
        </Animated.View>
      </Portal>
    );
  }
}