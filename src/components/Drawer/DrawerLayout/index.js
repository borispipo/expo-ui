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
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import {defaultStr} from "$cutils";
import theme,{Colors} from "$theme";
import {isMobileMedia} from "$cplatform/dimensions";
import Preloader from "$epreloader";
import {Elevations} from "$ecomponents/Surface";

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
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this._shouldSetPanResponder,
            onPanResponderGrant: this._panResponderGrant,
            onPanResponderMove: this._panResponderMove,
            onPanResponderTerminationRequest: () => false,
            onPanResponderRelease: this._panResponderRelease,
            onPanResponderTerminate: () => {},
        });
        const drawerShown = props.permanent? true : false;
        this.state = {
            accessibilityViewIsModal: false,
            drawerShown,
            openValue: new Animated.Value(drawerShown?1:0),
        };
    }

    getDrawerPosition() {
        const { drawerPosition } = this.props;
        const rtl = I18nManager.isRTL;
        return rtl
            ? drawerPosition === 'left' ? 'right' : 'left' // invert it
            : drawerPosition;
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
    renderContent({testID}){
        return <View style={[styles.main]} testID={testID+"_DrawerLayoutContent"}>
        {this.props.children}
    </View>;
    }
    render() {
        const { accessibilityViewIsModal, drawerShown, openValue } = this.state;
        const elevation = typeof this.props.elevation =='number'? this.props.elevation : 5;
        const elev = this.props.permanent && Elevations[elevation]? Elevations[elevation] : null;
        const testID = defaultStr(this.props.testID,"RN_DrawerLayoutComponent")
        let {
            drawerBackgroundColor,
            drawerWidth,
            drawerPosition,
            permanent,
            position,
            navigationViewRef,
        } = this.props;

        /**
    * We need to use the "original" drawer position here
    * as RTL turns position left and right on its own
    **/
        const dynamicDrawerStyles = {
            backgroundColor: this.getBackgroundColor(),
            width: drawerWidth,
            left: drawerPosition === 'left' ? 0 : null,
            right: drawerPosition === 'right' ? 0 : null,
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
        position = defaultStr(position).toLowerCase();
        if(position !=='left' && position !=='right'){
            position = 'left';
        }
        const posRight = position =="right"? true : false;
        if(permanent){
            dynamicDrawerStyles.position = "relative";
        }
        return (
            <View
                testID = {testID}
                style={{ flex: 1, backgroundColor: 'transparent',flexDirection:permanent?'row':'column'}}
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
                    {this.props.renderNavigationView()}
                </Animated.View>
                {!posRight && this.renderContent({testID})}
            </View>
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

    openDrawer = (options = {}) => {
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
    };

    closeDrawer = (options = {},showPreloader) => {
        if(typeof options ==='boolean'){
            showPreloader = options;
        }
        options = typeof options =='object' && options ? options : {};
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
                (DEVICE_WIDTH - this.props.drawerWidth);

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
            const overlayArea = DEVICE_WIDTH - this.props.drawerWidth;

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
        const { drawerWidth } = this.props;

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
});

DrawerLayout.propTypes = {
    children: PropTypes.any.isRequired,
    drawerBackgroundColor : PropTypes.string,
    drawerLockMode: PropTypes.oneOf(['unlocked','locked-closed', 'locked-open']),
    drawerPosition: PropTypes.oneOf(['left', 'right']),
    drawerWidth: PropTypes.number,
    keyboardDismissMode: PropTypes.oneOf(['none' , 'on-drag']),
    onDrawerClose: PropTypes.func,
    onDrawerOpen: PropTypes.func,
    onDrawerSlide: PropTypes.func,
    onDrawerStateChanged: PropTypes.func,
    renderNavigationView: PropTypes.any,
    statusBarBackgroundColor : PropTypes.string,
    useNativeAnimations: PropTypes.bool,
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