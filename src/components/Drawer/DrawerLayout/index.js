import React  from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    PanResponder,
    StyleSheet,
    TouchableWithoutFeedback,
    I18nManager,
} from 'react-native';
import { Portal } from 'react-native-paper';
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import {defaultStr,defaultObj,extendObj} from "$cutils";
import theme,{Colors} from "$theme";
import {isMobileMedia} from "$cplatform/dimensions";
import Preloader from "$epreloader";
import {Elevations} from "$ecomponents/Surface";
import {HStack} from "$ecomponents/Stack";
import Divider from "$ecomponents/Divider";
import Label from "$ecomponents/Label";
import Icon from "$ecomponents/Icon";
import AppBar from '$ecomponents/AppBar';

const MIN_SWIPE_DISTANCE = 3;
const DEVICE_WIDTH = Math.max(Dimensions.get('window').width,280);
const THRESHOLD = DEVICE_WIDTH / 2;
const VX_MAX = 0.1;

const IDLE = 'Idle';
const DRAGGING = 'Dragging';
const SETTLING = 'Settling';

export default class DrawerLayout extends React.PureComponent {
    prop;
    state
    _lastOpenValue
    _panResponder;
    _isClosing;
    _closingAnchorValue;
    _navigationViewRef = React.createRef(null);
    _backdropRef = React.createRef(null);

    constructor(props) {
        super(props);
        const isPortal = !! props.isPortal;
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this._shouldSetPanResponder,
            onPanResponderGrant: this._panResponderGrant,
            onPanResponderMove: this._panResponderMove,
            onPanResponderTerminationRequest: () => false,
            onPanResponderRelease: this._panResponderRelease,
            onPanResponderTerminate: () => {},
        });
        const drawerShown = !isPortal && props.permanent? true : false;
        this.state = {
            accessibilityViewIsModal: false,
            drawerShown,
            isPortal,
            portalProps : {},
            openValue: new Animated.Value(drawerShown?1:0),
        };
    }
    isPortal(){
        return !!this.state.isPortal;
    }
    getDrawerPosition() {
        const rtl = I18nManager.isRTL;
        const p = this.isPortal()? this.state.portalProps : this.props;
        let position = defaultStr(p?.drawerPosition,p?.position,this.props.drawerPosition).toLowerCase();
        if(position !=='left' && position !=='right'){
            position = 'left';
        }
        return rtl
            ? position === 'left' ? 'right' : 'left' // invert it
            : position;
    }
    isPositionRight(){
        return this.getDrawerPosition() === 'right';
    }
    isOpen(){
        return this.state.drawerShown;
    }

    isClosed(){
        return !this.state.drawerShown;
    }

    componentDidMount() {
        const { openValue } = this.state;
        openValue.addListener(({ value }) => {
            const drawerShown = value > 0;
            const accessibilityViewIsModal = drawerShown;
            if (drawerShown !== this.state.drawerShown) {
                this.setState({ drawerShown, accessibilityViewIsModal });
            }

            if (this.props.keyboardDismissMode === 'on-drag') {
                Keyboard.dismiss();
            }

            this._lastOpenValue = value;
            if (this.props.onDrawerSlide) {
                this.props.onDrawerSlide({ nativeEvent: { offset: value } });
            }
        });

    }
    forceRenderNavigationView(){
        if(!this.isOpen()) {
            return;
        }
        const upd = ()=>{
            if(this._navigationViewRef.current && this._navigationViewRef.current.setNativeProps){
                const children = this.props.renderNavigationView();
                this._navigationViewRef.current.setNativeProps({children,style:[{backgroundColor:this.getBackgroundColor()}]});
            }
        };
        if(this.props.permanent){
            return this.setState({key:!this.state.key});
        }
        return upd();
    }
    getBackgroundColor(){
        return Colors.isValid(this.props.drawerBackgroundColor)? this.props.backgroundColor : theme.colors.surface;
    }
    getPortalTestID(){
        return defaultStr(this.state.portalProps.testID,"RN_DrawerLayoutPortal");
    }
    renderPortalTitle(){
        const testID = this.getPortalTestID();
        const title = this.state.portalProps?.title;
        const isPositionRight = this.isPositionRight();
        const appBarProps = defaultObj(this.state.portalProps?.appBarProps);
        return <AppBar
            title={React.isValidElement(title) ? title : title || null}
            testID={testID+"_TitleContainer"} 
            onBackActionPress={(...args) =>{
                this.closeDrawer();
                return false;
            }}
            {...appBarProps}
            backActionProps = {extendObj(true,{},appBarProps.backActionProps,{icon:this.state.portalProps?.closeIcon || !isPositionRight == 'left'? 'chevron-left' : 'chevron-right'})}
        />
    }
    renderPortalChildren(){
        return <>
            {this.renderPortalTitle()}
            {React.isValidElement(this.state.portalProps?.children) ? this.state.portalProps?.children : null}
        </>
    }
    renderContent({testID}){
        return <View style={[styles.main]} testID={testID+"_DrawerLayoutContent"}>
        {this.props.children}
    </View>;
    }
    /***
     * retourne le min entre la dimension de l'écran et la prop drawerWidth passée en paramètre
     */
    getDrawerWidth() { 
        return Math.min(defaultNumber(this.isPortal()? this.state.portalProps?.drawerWidth : 0,this.props.drawerWidth),Dimensions.get("window").width);
    }
    render() {
        const { accessibilityViewIsModal, drawerShown, openValue } = this.state;
        const elevation = typeof this.props.elevation =='number'? this.props.elevation : 5;
        const elev = this.props.permanent && Elevations[elevation]? Elevations[elevation] : null;
        const testID = defaultStr(this.props.testID,"RN_DrawerLayoutComponent")
        let { permanent,
            navigationViewRef,
        } = this.props;
        let drawerWidth = this.getDrawerWidth();
        /**
    * We need to use the "original" drawer position here
    * as RTL turns position left and right on its own
    **/
        const posRight = this.isPositionRight();
        const dynamicDrawerStyles = {
            backgroundColor: this.getBackgroundColor(),
            width: drawerWidth,
            left: !posRight ? 0 : null,
            right: posRight? 0 : null,
        };

        /* Drawer styles */
        let outputRange;

        if (this.getDrawerPosition() === 'left') {
            outputRange = [-drawerWidth, 0];
        } else {
            outputRange = [drawerWidth, 0];
        }

        const drawerTranslateX = openValue.interpolate({
            inputRange: [0, 1],
            outputRange,
            extrapolate: 'clamp',
        });
        const animatedDrawerStyles = {
            transform: [{ translateX: drawerTranslateX }],
        };

        /* Overlay styles */
        const overlayOpacity = openValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.7],
            extrapolate: 'clamp',
        });
        const animatedOverlayStyles = { opacity: overlayOpacity };
        const pointerEvents = drawerShown || permanent ? 'auto' : 'none';
        
        
        if(permanent){
            dynamicDrawerStyles.position = "relative";
        }
        const Wrapper = this.isPortal()? Portal  : React.Fragment;
        const canRender = this.isPortal()? this.state.drawerShown : true;
        return (
            <Wrapper>
                <View
                    testID = {testID}
                    style={[{ flex: canRender && 1 || 0, backgroundColor: 'transparent',flexDirection:permanent?'row':'column'},canRender?styles.portalVisibleContainer:styles.portalNotVisibleContainer]}
                    {...this._panResponder.panHandlers}
                >
                    {!permanent && <TouchableWithoutFeedback
                        style={{pointerEvents}}
                        testID = {testID+"_TouchableWithoutFeedBack"}
                        onPress={this._onOverlayClick}
                    >
                        <Animated.View
                            testID={testID+"_Backdrow"}
                            ref = {this._backdropRef}
                            style={[styles.overlay,{backgroundColor:theme.colors.backdrop},{pointerEvents}, animatedOverlayStyles]}
                        />
                    </TouchableWithoutFeedback>}
                    {posRight && this.renderContent({testID})}
                    <Animated.View
                        testID={testID+"_NavigationViewContainer"}
                        ref={React.mergeRefs(navigationViewRef,this._navigationViewRef)}
                        accessibilityViewIsModal={accessibilityViewIsModal}
                        style={[
                            styles.drawer,
                            dynamicDrawerStyles,
                            elev,
                            animatedDrawerStyles,
                        ]}
                    >
                        {this.isPortal()? this.renderPortalChildren() : this.props.renderNavigationView()}
                    </Animated.View>
                    {!posRight && this.renderContent({testID})}
                </View>
            </Wrapper>
        );
    }

    _onOverlayClick = (e) => {
        e.stopPropagation();
        if (!this._isLockedClosed() && !this._isLockedOpen()) {
            this.closeDrawer();
        }
    };

    _emitStateChanged = (newState) => {
        if (this.props.onDrawerStateChanged) {
            this.props.onDrawerStateChanged(newState);
        }
    };

    openDrawer = (options) => {
        options = Object.assign({}, options);
        const cb = ()=>{
            this._emitStateChanged(SETTLING);
            Animated.spring(this.state.openValue, {
                toValue: 1,
                bounciness: 0,
                restSpeedThreshold: 0.1,
                useNativeDriver: this.props.useNativeAnimations,
                ...options,
            }).start(() => {
                if (this.props.onDrawerOpen) {
                    this.props.onDrawerOpen();
                }
                this._emitStateChanged(IDLE);
            });
        }
        if(this.isPortal()){
            this.setState({portalProps:options},cb)
        } else {
            cb();
        }
    };

    closeDrawer = (options = {},showPreloader) => {
        if(typeof options ==='boolean'){
            showPreloader = options;
        }
        options = Object.assign({}, options);
        if(typeof showPreloader !== 'boolean'){
            showPreloader = options.showPreloader || options.preloader;
        }
        if(typeof showPreloader !== 'boolean'){
            showPreloader = isMobileMedia();
        }
        this._emitStateChanged(SETTLING);
        const willOpenPreloader = showPreloader && this.props.permanent ? true : false;
        if(willOpenPreloader){
            Preloader.open();
        }
        Animated.spring(this.state.openValue, {
            toValue: 0,
            bounciness: 0,
            restSpeedThreshold: 1,
            useNativeDriver: this.props.useNativeAnimations,
            ...options,
        }).start(() => {
            if(willOpenPreloader){
                Preloader.close();
            }
            if (this.props.onDrawerClose) {
                this.props.onDrawerClose();
            }
            this._emitStateChanged(IDLE);
        });
    };

    _handleDrawerOpen = () => {
        if (this.props.onDrawerOpen) {
            this.props.onDrawerOpen();
        }
    };

    _handleDrawerClose = () => {
        if (this.props.onDrawerClose) {
            this.props.onDrawerClose();
        }
    };

    _shouldSetPanResponder = (
        e,
        { moveX, dx, dy },
    ) => {
        if (!dx || !dy || Math.abs(dx) < MIN_SWIPE_DISTANCE) {
            return false;
        }

        if (this._isLockedClosed() || this._isLockedOpen()) {
            return false;
        }
        if (this.getDrawerPosition() === 'left') {
            const overlayArea = DEVICE_WIDTH -
                (DEVICE_WIDTH - this.getDrawerWidth());

            if (this._lastOpenValue === 1) {
                if (
                    (dx < 0 && Math.abs(dx) > Math.abs(dy) * 3) ||
                    moveX > overlayArea
                ) {
                    this._isClosing = true;
                    this._closingAnchorValue = this._getOpenValueForX(moveX);
                    return true;
                }
            } else {
                if (moveX <= 35 && dx > 0) {
                    this._isClosing = false;
                    return true;
                }

                return false;
            }
        } else {
            const overlayArea = DEVICE_WIDTH - this.getDrawerWidth();
            if (this._lastOpenValue === 1) {
                if (
                    (dx > 0 && Math.abs(dx) > Math.abs(dy) * 3) ||
                    moveX < overlayArea
                ) {
                    this._isClosing = true;
                    this._closingAnchorValue = this._getOpenValueForX(moveX);
                    return true;
                }
            } else {
                if (moveX >= DEVICE_WIDTH - 35 && dx < 0) {
                    this._isClosing = false;
                    return true;
                }

                return false;
            }
        }
    };

    _panResponderGrant = () => {
        this._emitStateChanged(DRAGGING);
    };

    _panResponderMove = (e, { moveX }) => {
        let openValue = this._getOpenValueForX(moveX);

        if (this._isClosing) {
            openValue = 1 - (this._closingAnchorValue - openValue);
        }

        if (openValue > 1) {
            openValue = 1;
        } else if (openValue < 0) {
            openValue = 0;
        }

        this.state.openValue.setValue(openValue);
    };

    _panResponderRelease = (
        e,
        { moveX, vx },
    ) => {
        const previouslyOpen = this._isClosing;
        const isWithinVelocityThreshold = vx < VX_MAX && vx > -VX_MAX;

        if (this.getDrawerPosition() === 'left') {
            if (
                (vx > 0 && moveX > THRESHOLD) ||
                vx >= VX_MAX ||
                (isWithinVelocityThreshold &&
                    previouslyOpen &&
                    moveX > THRESHOLD)
            ) {
                this.openDrawer({ velocity: vx });
            } else if (
                (vx < 0 && moveX < THRESHOLD) ||
                vx < -VX_MAX ||
                (isWithinVelocityThreshold && !previouslyOpen)
            ) {
                this.closeDrawer({ velocity: vx });
            } else if (previouslyOpen) {
                this.openDrawer();
            } else {
                this.closeDrawer();
            }
        } else {
            if (
                (vx < 0 && moveX < THRESHOLD) ||
                vx <= -VX_MAX ||
                (isWithinVelocityThreshold &&
                    previouslyOpen &&
                    moveX < THRESHOLD)
            ) {
                this.openDrawer({ velocity: (-1) * vx });
            } else if (
                (vx > 0 && moveX > THRESHOLD) ||
                vx > VX_MAX ||
                (isWithinVelocityThreshold && !previouslyOpen)
            ) {
                this.closeDrawer({ velocity: (-1) * vx });
            } else if (previouslyOpen) {
                this.openDrawer();
            } else {
                this.closeDrawer();
            }
        }
    };

    _isLockedClosed = () => {
        return this.props.drawerLockMode === 'locked-closed' &&
            !this.state.drawerShown;
    };

    _isLockedOpen = () => {
        return this.props.drawerLockMode === 'locked-open' &&
            this.state.drawerShown;
    };

    _getOpenValueForX(x) {
        const drawerWidth = this.getDrawerWidth();

        if (this.getDrawerPosition() === 'left') {
            return x / drawerWidth;
        }

        // position === 'right'
        return (DEVICE_WIDTH - x) / drawerWidth;
    }
}

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 1001,
    },
    main: {
        flex: 1,
        zIndex: 0,
        width : "100%",
        height : "100%",
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1000,
    },
    portalVisibleContainer : {
        ...StyleSheet.absoluteFill,
    },
    portalNotVisibleContainer : {
        opacity : 0,
    },
    portalTitle : {
        justifyContent : 'space-between',
        alignItems : 'center',
        paddingHorizontal : 10,
        flexWrap : 'nowrap',
    },
    portalTitleText : {
        fontSize : 16,
        fontWeight : 'bold',
    },
});
const posPropType = PropTypes.oneOf(['left', 'right']);
DrawerLayout.propTypes = {
    isPortal : PropTypes.bool,
    children: PropTypes.any,
    drawerBackgroundColor : PropTypes.string,
    drawerLockMode: PropTypes.oneOf(['unlocked','locked-closed', 'locked-open']),
    drawerPosition: posPropType,
    drawerWidth: PropTypes.number,
    keyboardDismissMode: PropTypes.oneOf(['none' , 'on-drag']),
    onDrawerClose: PropTypes.func,
    onDrawerOpen: PropTypes.func,
    onDrawerSlide: PropTypes.func,
    onDrawerStateChanged: PropTypes.func,
    renderNavigationView: PropTypes.any,
    statusBarBackgroundColor : PropTypes.string,
    useNativeAnimations: PropTypes.bool,
     /****
   * les props à passer à la fonction open du drawer, lorsqu'il s'agit du portal
   * 
   */
  portalProps : PropTypes.shape({
    title : PropTypes.oneOfType([
      PropTypes.string,//si title est une chaine de caractère alors il sera rendu avec le bouton close permettant de fermer le Drawer
      PropTypes.node,
      PropTypes.element,
      PropTypes.elementType,
    ]),
    titleProps : PropTypes.shape({
        ...defaultObj(Label.propTypes),
    }),
    closeIconProps : PropTypes.shape({
        ...defaultObj(Icon.propTypes),
    }),
    icon : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
        PropTypes.element,
    ]),
    children : PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.element,
    ]),
    drawerPosition : posPropType,
    position : posPropType,
    drawerWidth : PropTypes.number,
    appBarProps : PropTypes.shape({
        ...defaultObj(AppBar.propTypes),
    }),
  }),
}

DrawerLayout.defaultProps = {
    drawerWidth: 0,
    drawerPosition: 'left',
    useNativeAnimations: false,
};

DrawerLayout.positions = {
    Left: 'left',
    Right: 'right',
};