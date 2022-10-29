import React,{BaseComponent as AppComponent} from '$react';
import View from "$components/View";
import ScrollView  from "$components/ScrollView";
import {
  Platform,
  StyleSheet,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  I18nManager,
  TouchableWithoutFeedback,
  findNodeHandle,
} from 'react-native';
import PropTypes from "prop-types";
import { withTheme,Surface,Portal} from 'react-native-paper';
//import Surface from "$components/Surface";
import { NativeModules} from 'react-native';
import {defaultDecimal,extendObj} from "$utils";
import theme,{StylePropTypes} from "$theme";
import APP from "$app/instance";
import MenuItem from "./Item";
import {isWeb} from "$platform";

const RESIZE_PAGE = APP.EVENTS.RESIZE_PAGE;

const estimatedStatusBarHeight =
  NativeModules.NativeUnimoduleProxy?.modulesConstants?.ExponentConstants
    ?.statusBarHeight ?? 0;
const APPROX_STATUSBAR_HEIGHT = Platform.select({
    android: estimatedStatusBarHeight,
    ios: Platform.Version < 11 ? estimatedStatusBarHeight : 0,
  });
  

// Minimum padding between the edge of the screen and the menu
const SCREEN_INDENT = 8;
// From https://material.io/design/motion/speed.html#duration
const ANIMATION_DURATION = 250;
// From the 'Standard easing' section of https://material.io/design/motion/speed.html#easing
const EASING = Easing.bezier(0.4, 0, 0.2, 1);

class _Menu extends AppComponent {
  static Item = MenuItem;

  static defaultProps = {
    statusBarHeight: APPROX_STATUSBAR_HEIGHT,
    overlayAccessibilityLabel: 'Close menu',
  };

  static getDerivedStateFromProps1(nextProps, prevState) {
    if (nextProps.visible && !prevState.rendered) {
      return { rendered: true };
    }

    return null;
  }
  constructor(props){
    super(props);
    extendObj(this.state,{
      rendered: this.props.visible,
      top: 0,
      left: 0,
      menuLayout: { width: 0, height: 0 },
      anchorLayout: { width: 0, height: 0 },
      opacityAnimation: new Animated.Value(0),
      scaleAnimation: new Animated.ValueXY({ x: 0, y: 0 }),
    });
    this._events.RESIZE_PAGE = this.handleDismiss.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      this.updateVisibility();
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.removeListeners();
  }

  anchor = null;
  menu = null;
  backHandlerSubscription;

  isCoordinate = (anchor) =>
    !React.isValidElement(anchor) &&
    typeof anchor?.x === 'number' &&
    typeof anchor?.y === 'number';

  measureMenuLayout = () =>
    new Promise((resolve) => {
      if (this.menu) {
        this.menu.measureInWindow((x, y, width, height) => {
          resolve({ x, y, width:Math.max(width,defaultDecimal(this.props.minWidth)), height });
        });
      }
    });

  measureAnchorLayout = () =>
    new Promise((resolve) => {
      const { anchor } = this.props;
      if (this.isCoordinate(anchor)) {
        resolve({ x: anchor.x, y: anchor.y, width: 0, height: 0 });
        return;
      }

      if (this.anchor) {
        this.anchor.measureInWindow((x, y, width, height) => {
          resolve({ x, y, width, height });
        });
      }
    });

  updateVisibility = async () => {
    // _Menu is rendered in Portal, which updates items asynchronously
    // We need to do the same here so that the ref is up-to-date
    await Promise.resolve();

    if (this.props.visible) {
      this.show();
    } else {
      this.hide();
    }
  };

  isBrowser = () => Platform.OS === 'web' && 'document' in global;

  focusFirstDOMNode = (el) => {
    if (el && this.isBrowser()) {
      // When in the browser, we want to focus the first focusable item on toggle
      // For example, when menu is shown, focus the first item in the menu
      // And when menu is dismissed, send focus back to the button to resume tabbing
      const node = findNodeHandle(el);
      const focusableNode = node.querySelector(
        // This is a rough list of selectors that can be focused
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      focusableNode?.focus();
    }
  };

  handleDismiss = () => {
    if (this.props.visible) {
      this.props.onDismiss();
    }
    return true;
  };

  handleKeypress = (e) => {
    if (e.key === 'Escape') {
      this.props.onDismiss();
    }
  };
  
  attachListeners = () => {
    this.backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleDismiss
    );
    APP.on(RESIZE_PAGE,this._events.RESIZE_PAGE);

    this.isBrowser() && document.addEventListener('keyup', this.handleKeypress);
  };

  removeListeners = () => {
    if (this.backHandlerSubscription?.remove) {
      this.backHandlerSubscription.remove();
    } else {
      BackHandler.removeEventListener('hardwareBackPress', this.handleDismiss);
    }

    APP.off(RESIZE_PAGE,this._events.RESIZE_PAGE);
    this.clearEvents();

    this.isBrowser() &&
      document.removeEventListener('keyup', this.handleKeypress);
  };

  show = async () => {
    if(!this._isMounted()) return;
    const windowLayout = Dimensions.get('window');
    const [menuLayout, anchorLayout] = await Promise.all([
      this.measureMenuLayout(),
      this.measureAnchorLayout(),
    ]);

    // When visible is true for first render
    // native views can be still not rendered and
    // measureMenuLayout/measureAnchorLayout functions
    // return wrong values e.g { x:0, y: 0, width: 0, height: 0 }
    // so we have to wait until views are ready
    // and rerun this function to show menu
    if (
      !windowLayout.width ||
      !windowLayout.height ||
      !menuLayout.width ||
      !menuLayout.height ||
      (!anchorLayout.width && !this.isCoordinate(this.props.anchor)) ||
      (!anchorLayout.height && !this.isCoordinate(this.props.anchor))
    ) {
      requestAnimationFrame(this.show);
      return;
    }

    this.setState(
      () => ({
        left: anchorLayout.x,
        top: anchorLayout.y,
        anchorLayout: {
          height: anchorLayout.height,
          width: anchorLayout.width,
        },
        menuLayout: {
          width: menuLayout.width,
          height: menuLayout.height,
        },
      }),
      () => {
        this.attachListeners();

        const animation = theme.animation;
        Animated.parallel([
          Animated.timing(this.state.scaleAnimation, {
            toValue: { x: menuLayout.width, y: menuLayout.height },
            duration: ANIMATION_DURATION * animation.scale,
            easing: EASING,
            useNativeDriver: true,
          }),
          Animated.timing(this.state.opacityAnimation, {
            toValue: 1,
            duration: ANIMATION_DURATION * animation.scale,
            easing: EASING,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            this.focusFirstDOMNode(this.menu);
          }
        });
      }
    );
  };

  hide = () => {
    this.removeListeners();
    if(!this._isMounted()) return;
    const animation = theme.animation;
    Animated.timing(this.state.opacityAnimation, {
      toValue: 0,
      duration: ANIMATION_DURATION * animation.scale,
      easing: EASING,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        this.setState({ menuLayout: { width: 0, height: 0 }, rendered: false });
        this.state.scaleAnimation.setValue({ x: 0, y: 0 });
        this.focusFirstDOMNode(this.anchor);
      }
    });
  };

  render() {
    const {
      visible,
      anchor,
      contentStyle,
      style,
      children,
      statusBarHeight,
      onDismiss,
      handleScroll:canHandleScroll,
      overlayAccessibilityLabel,
      sameWidth,
      minWidth:customMinWidth,
    } = this.props;
    const testID = defaultStr(this.props.testID,"RN_MainMenuComponent");
    const {
      menuLayout,
      anchorLayout,
      opacityAnimation,
      scaleAnimation,
    } = this.state;
    const rendered = visible;
    const minWidth = defaultDecimal(customMinWidth);
    let { left, top } = this.state;

    // I don't know why but on Android measure function is wrong by 24
    const additionalVerticalValue = Platform.select({
      android: statusBarHeight,
      default: 0,
    });

    const scaleTransforms = [
      {
        scaleX: scaleAnimation.x.interpolate({
          inputRange: [0, menuLayout.width],
          outputRange: [0, 1],
        }),
      },
      {
        scaleY: scaleAnimation.y.interpolate({
          inputRange: [0, menuLayout.height],
          outputRange: [0, 1],
        }),
      },
    ];

    const windowLayout = Dimensions.get('window');

    // We need to translate menu while animating scale to imitate transform origin for scale animation
    const positionTransforms = [];

    // Check if menu fits horizontally and if not align it to right.
    if (left <= windowLayout.width - menuLayout.width - SCREEN_INDENT) {
      positionTransforms.push({
        translateX: scaleAnimation.x.interpolate({
          inputRange: [0, menuLayout.width],
          outputRange: [-(menuLayout.width / 2), 0],
        }),
      });

      // Check if menu position has enough space from left side
      if (left < SCREEN_INDENT) {
        left = SCREEN_INDENT;
      }
    } else {
      positionTransforms.push({
        translateX: scaleAnimation.x.interpolate({
          inputRange: [0, menuLayout.width],
          outputRange: [menuLayout.width / 2, 0],
        }),
      });

      left += anchorLayout.width - menuLayout.width;

      const right = left + menuLayout.width;
      // Check if menu position has enough space from right side
      if (right > windowLayout.width - SCREEN_INDENT) {
        left = windowLayout.width - SCREEN_INDENT - menuLayout.width;
      }
    }
    const handleScroll = canHandleScroll !== false? true : false;
    
    // If the menu is larger than available vertical space,
    // calculate the height of scrollable view
    let scrollableMenuHeight = 0;

    // Check if the menu should be scrollable
    if (
      // Check if the menu overflows from bottom side
      top >=
        windowLayout.height -
          menuLayout.height - 
          SCREEN_INDENT -
          additionalVerticalValue &&
      // And bottom side of the screen has more space than top side
      top <= windowLayout.height - top
    ) {
      // Scrollable menu should be below the anchor (expands downwards)
      if(handleScroll){
        scrollableMenuHeight =
        windowLayout.height - top - SCREEN_INDENT - additionalVerticalValue;
      }
    } else if (
      // Check if the menu overflows from bottom side
      top >=
        windowLayout.height -
          menuLayout.height -
          SCREEN_INDENT -
          additionalVerticalValue &&
      // And top side of the screen has more space than bottom side
      top >= windowLayout.height - top &&
      // And menu overflows from top side
      top <=
        menuLayout.height -
          anchorLayout.height +
          SCREEN_INDENT -
          additionalVerticalValue
    ) {
      // Scrollable menu should be above the anchor (expands upwards)
      if(handleScroll){
        scrollableMenuHeight =
        top + anchorLayout.height - SCREEN_INDENT + additionalVerticalValue;
      }
    }

    // Scrollable menu max height
    if(handleScroll){
      scrollableMenuHeight = scrollableMenuHeight > windowLayout.height - 2 * SCREEN_INDENT
        ? windowLayout.height - 2 * SCREEN_INDENT
        : scrollableMenuHeight;
    }
    // _Menu is typically positioned below the element that generates it
    // So first check if it fits below the anchor (expands downwards)
    if (
      // Check if menu fits vertically
      top <=
        windowLayout.height -
          menuLayout.height -
          SCREEN_INDENT -
          additionalVerticalValue ||
      // Or if the menu overflows from bottom side
      (top >=
        windowLayout.height -
          menuLayout.height -
          SCREEN_INDENT -
          additionalVerticalValue &&
        // And bottom side of the screen has more space than top side
        top <= windowLayout.height - top)
    ) {
      positionTransforms.push({
        translateY: scaleAnimation.y.interpolate({
          inputRange: [0, menuLayout.height],
          outputRange: [-((scrollableMenuHeight || menuLayout.height) / 2), 0],
        }),
      });

      // Check if menu position has enough space from top side
      if (top < SCREEN_INDENT) {
        top = SCREEN_INDENT;
      }
    } else {
      positionTransforms.push({
        translateY: scaleAnimation.y.interpolate({
          inputRange: [0, menuLayout.height],
          outputRange: [(scrollableMenuHeight || menuLayout.height) / 2, 0],
        }),
      });

      top += anchorLayout.height - (scrollableMenuHeight || menuLayout.height);

      const bottom =
        top +
        (scrollableMenuHeight || menuLayout.height) +
        additionalVerticalValue;

      // Check if menu position has enough space from bottom side
      if (bottom > windowLayout.height - SCREEN_INDENT) {
        top =
          scrollableMenuHeight === windowLayout.height - 2 * SCREEN_INDENT
            ? -SCREEN_INDENT * 2
            : windowLayout.height -
              menuLayout.height -
              SCREEN_INDENT -
              additionalVerticalValue;
      }
    }

    const shadowMenuContainerStyle = {
      opacity: opacityAnimation,
      transform: scaleTransforms,
      borderRadius: theme.roundness,
      ...(scrollableMenuHeight && handleScroll ? { height: scrollableMenuHeight } : {}),
    };
    
    //- (sameWidth ? anchorLayout.height  : 0)
    const positionStyle = {
      top: this.isCoordinate(anchor) ? top : top + additionalVerticalValue,
      ...(I18nManager.isRTL ? { right: left } : { left }),
    };
    if(sameWidth){
      const bottom = windowLayout.height - SCREEN_INDENT - menuLayout.height - anchorLayout.height;
      if(bottom >= top - SCREEN_INDENT){
         positionStyle.top += anchorLayout.height;
      }
    }
    if(positionStyle.left < SCREEN_INDENT){
      positionStyle.left = SCREEN_INDENT;
    }
    if(positionStyle.top < SCREEN_INDENT){
      positionStyle.top = SCREEN_INDENT;
    }
    const maxMenuHeight = windowLayout.height - top - SCREEN_INDENT;
    const contentContainerStyle = maxMenuHeight > SCREEN_INDENT ? {maxHeight:maxMenuHeight} : undefined;
    return (
      <View
        testID = {testID}
        ref={(ref) => {
          this.anchor = ref;
        }}
        collapsable={false}
        style = {{backgroundColor:'transparent'}}
      >
        {this.isCoordinate(anchor) ? null : anchor}
        {rendered ? (
          <Portal>
            <TouchableWithoutFeedback
              testID={testID+"_TouchableWithoutFeedBack"}
              accessibilityLabel={overlayAccessibilityLabel}
              accessibilityRole="button"
              onPress={onDismiss}
            >
              <View style={[StyleSheet.absoluteFill,{flex:1,backgroundColor:'transparent'}]} testID={testID+"_Backdrop"} />
            </TouchableWithoutFeedback>
            <View
              testID = {testID+"_ContentContainer"}
              ref={(ref) => {
                this.menu = ref;
              }}
              collapsable={false}
              accessibilityViewIsModal={visible}
              style={[styles.wrapper, positionStyle, style]}
              pointerEvents={visible ? 'box-none' : 'none'}
              onAccessibilityEscape={onDismiss}
            >
              <Animated.View style={{ transform: positionTransforms }} testID={testID+"_Animated"}>
                <Surface
                  elevation = {5}
                  testID= {testID+"_Content"}
                  style={
                    [
                      styles.shadowMenuContainer,
                      shadowMenuContainerStyle,
                      contentStyle,
                      {backgroundColor : theme.colors.surface},
                      sameWidth && anchorLayout.width ? {width:Math.max(anchorLayout.width,minWidth)} : undefined,
                    ]
                  }
                >
                  {((scrollableMenuHeight|| contentContainerStyle) && (<ScrollView contentContainerStyle={contentContainerStyle} testID={testID+"_ScrollView"}>{children}</ScrollView>
                  )) || children}
                </Surface>
              </Animated.View>
            </View>
          </Portal>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  shadowMenuContainer: {
    opacity: 0,
    paddingVertical: 8,
    elevation: 8,
  },
});



const Menu = withTheme(_Menu);

export default Menu;

Menu.propTypes = {
    minWidth : PropTypes.number,///la longueur minimale du menu
    handleScroll : PropTypes.bool, //si le contenu est scrollable
    /**
     * Whether the _Menu is currently visible.
     */
    visible: PropTypes.bool,
    /**
     * The anchor to open the menu from. In most cases, it will be a button that opens the menu.
     */
    anchor: PropTypes.any,
        
    /**
     * Extra margin to add at the top of the menu to account for translucent status bar on Android.
     * If you are using Expo, we assume translucent status bar and set a height for status bar automatically.
     * Pass `0` or a custom value to and customize it.
     * This is automatically handled on iOS.
     */
    statusBarHeight: PropTypes.number,
    /**
     * Callback called when _Menu is dismissed. The `visible` prop needs to be updated when this is called.
     */
    onDismiss: PropTypes.func,
    /**
     * Accessibility label for the overlay. This is read by the screen reader when the user taps outside the menu.
     */
    overlayAccessibilityLabel: PropTypes.string,
    /**
     * Content of the `_Menu`.
     */
    children: PropTypes.node,
    /**
     * Style of menu's inner content.
     */
    contentStyle : StylePropTypes,
    style : StylePropTypes,
}
