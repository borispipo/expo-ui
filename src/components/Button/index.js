import React from '$react';
import {
  Animated,
  StyleSheet,
} from 'react-native';
import View from "$ecomponents/View";
import Tooltip from "$ecomponents/Tooltip";
import theme,{DISABLED_OPACITY,Colors,cursorNotAllowed,StylePropsTypes} from "$theme";
import Icon from "$ecomponents/Icon";
import {TouchableRipple} from "react-native-paper";
import ActivityIndicator from "$ecomponents/ActivityIndicator";
import Surface from "$ecomponents/Surface";
import Label from "$ecomponents/Label";
import {defaultObj,defaultVal,defaultDecimal,defaultStr} from "$utils";

import PropTypes from "prop-types";
const white = "white",black = "black";

const ButtonComponent = React.forwardRef(({
  disabled,
  compact,
  mode = 'text',
  dark,
  loading,
  icon,
  color: buttonColor,
  children,
  text,
  label,
  upperCase = true,
  accessibilityLabel,
  onPress,
  iconPosition,
  iconBefore,
  onLongPress,
  style,
  contentStyle,
  contentProps,
  labelStyle,
  labelProps,
  testID,
  iconSize,
  iconProps,
  left,
  elevation : customElevation,
  right,
  accessible,
  backgroundColor,
  borderColor,
  accessibilityRole,
  contentContainerProps,
  loadingProps,
  rounded,
  containerProps,
  disableRipple,
  noPadding,
  noMargin,
  isAlert,
  borderRadius,
  ...rest
},ref) => {
  children = defaultVal(children,label,text);
  testID = defaultStr(testID,'RN_ButtonComponent');
  upperCase = upperCase ? true : false;
  const isElevationNumber = typeof customElevation =='number' && customElevation ? true : false;
  const hasElevation = mode  ==='contained' || isElevationNumber ?true : false;
  const elev = hasElevation ? (isElevationNumber && customElevation || 5) : 0;
  const {roundness } = theme;
  const { current: elevation } = React.useRef(
    new Animated.Value(elev)
  );
  React.useEffect(() => {
    elevation.setValue(elev);
  }, [mode, elevation,customElevation]);

  const handlePressIn = () => {
    if (hasElevation) {
      const { scale } = theme.animation;
      Animated.timing(elevation, {
        toValue: 8,
        duration: 200 * scale,
        useNativeDriver: true,
      }).start();
    }
  };

  const [state,setState] = React.useState({
     isLoading : typeof loading =='boolean'? loading : false,
     isDisabled : typeof disabled =='boolean'? disabled : false,
  });
  const {isLoading,isDisabled} = state;
  const setIsLoading = (loading)=>{
      return toggleState({isLoading:loading});
  }
  const setIsDisabled = (disabled)=>{
      return toggleState({isDisabled:disabled});
  }
  const toggleState = (s)=>{
     if(isObj(s) && (typeof s.isLoading =='boolean' || typeof s.isDisabled =='boolean')){
        const loading = typeof s.isLoading =='boolean' && s.isLoading !== isLoading ? s.isLoading : typeof s.loading =='boolean' && s.loading !== isLoading ? s.loading : undefined;
        const disabled = typeof s.isDisabled =='boolean' && s.isDisabled !== isDisabled ? s.isDisabled : typeof s.disabled =='boolean' && s.disabled !== isDisabled ? s.disabled : undefined;
        if(loading !== undefined || disabled !== undefined){
            const nState = {};
            if(loading !== undefined){
               nState.isLoading = loading;
            }
            if(disabled !== undefined){
               nState.isDisabled = disabled;
            }
            setState({...state,...nState});
            return true;
        }
        return false;
     }
  }
  React.useEffect(()=>{
      if(typeof disabled !=='boolean' && typeof loading !== 'boolean') return;
      if(typeof loading =='boolean' && loading == isLoading && typeof disabled =='boolean' && disabled === isDisabled){
          return;
      }
      setState({
        ...state,
        isLoading : typeof loading =='boolean' ? loading : state.isLoading,
        isDisabled : typeof disabled =='boolean' ? disabled : state.isDisabled,
      });
  },[loading,disabled]);
    
  const handlePressOut = () => {
    if (hasElevation) {
      const { scale } = theme.animation;
      Animated.timing(elevation, {
        toValue: elev,
        duration: 150 * scale,
        useNativeDriver: true,
      }).start();
    }
  };
  contentContainerProps = defaultObj(contentContainerProps);
  containerProps = defaultObj(containerProps);
  style = StyleSheet.flatten(style) || {};
  labelStyle = StyleSheet.flatten([labelStyle]);
  disabled = isDisabled || isLoading;
  let textColor = Colors.isValid(buttonColor)?buttonColor : Colors.isValid(labelStyle.color) ? labelStyle.color : Colors.isValid(style.color)? style.color  : theme.colors.primary,
    borderWidth;
    const restButtonStyle = {
      opacity : disabled ? DISABLED_OPACITY : undefined
    };
  
  iconProps = defaultObj(iconProps);
  labelProps = defaultObj(labelProps);
  contentProps = defaultObj(contentProps);
  
  if (!disabled && hasElevation) {
    backgroundColor = Colors.isValid(backgroundColor)? backgroundColor : Colors.isValid(style.backgroundColor)?style.backgroundColor : undefined;
    borderColor = Colors.isValid(borderColor)? borderColor : Colors.isValid(style.borderColor)? style.borderColor : undefined;
  }
  if(theme.isDark() && !hasElevation){
    textColor = white;
  } 

  const rippleColor = Colors.setAlpha(textColor,0.32);
  const buttonStyle = {
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius: typeof borderRadius =='number' ? borderRadius : typeof style.borderRadius ==='number'? style.borderRadius : rounded ? roundness : 0,
  };
  
  loadingProps = defaultObj(loadingProps);

  const elevationRes = disabled || !hasElevation ? 0 : elevation?.__getValue();
  contentStyle = Object.assign({},StyleSheet.flatten([hasElevation ? (icon?styles.elevation2icon:(isAlert?styles.elevationAlert:styles.elevationOnly)):null,contentProps.style,contentStyle]));
  
  if(iconPosition == 'top'){
    contentStyle.flexDirection = 'column';
  } else if(iconPosition =='bottom'){
    contentStyle.flexDirection = 'column-reverse';
  } else if(iconPosition =='right' || iconBefore === false){
      contentStyle.flexDirection = "row-reverse";
  }

  const iconStyle =
    contentStyle.flexDirection?.contains('reverse')
      ? styles.iconReverse
      : styles.icon;
  const leftRProps = {color:textColor,iconSize};
  const notAllowedStyle = disabled?cursorNotAllowed:undefined
  const textStyle = { color: textColor};
  iconSize = defaultDecimal(iconSize,iconProps.size,24);
  const surfaceStyle = StyleSheet.flatten([
    styles.button,
    compact && styles.compact,
    buttonStyle,
    isAlert && styles.surfaceAlert,
    style,
    restButtonStyle,
  ]);
  if(!hasElevation && !Colors.isValid(surfaceStyle.backgroundColor)){
    surfaceStyle.backgroundColor = "transparent";
  }
  return <Tooltip ref={ref} {...rest}>
        {(tProps,tRef)=>{
           return <View 
              testID = {testID+"_Container"} {...containerProps} ref={(el)=>{
                if(el){
                  el.setIsLoading = setIsLoading;
                  el.setIsDisabled = setIsDisabled;
                  el.isDisabled = ()=>{
                    return state.isDisabled || state.isLoading;
                  };
                  el.isEnabled = ()=>{
                    return !state.isDisabled && !state.isLoading;
                  };
                  el.disable = ()=>{
                    return toggleState({isDisabled:true});
                  };
                  el.toggleState = toggleState;
                  el.enable = ()=>{
                    return toggleState({isDisabled:false});
                  }
                }
                React.setRef(tRef,el);
                React.setRef(ref,el);
            }}
           >
                <Surface
                  testID = {testID+"_Surface"}
                  {...tProps}
                  elevation = {elevationRes}
                  style={surfaceStyle}
                >
                  <TouchableRipple
                    delayPressIn={0}
                    onPress={isLoading ? undefined : onPress}
                    onLongPress={onLongPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    accessibilityLabel={accessibilityLabel}
                    // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
                    accessibilityTraits={disabled ? ['button', 'disabled'] : 'button'}
                    accessibilityComponentType="button"
                    accessibilityRole={disabled?accessibilityRole || "button":undefined}
                    accessibilityState={{ disabled }}
                    accessible={accessible}
                    disabled={disabled}
                    rippleColor={disableRipple?'transparent':rippleColor}
                    {...contentContainerProps}
                    style={[/*touchableStyle*/,contentContainerProps.style,notAllowedStyle]}
                    testID={testID}
                  >
                    <View testID={testID+"_Content"} {...contentProps} style={[styles.content, contentStyle,noPadding && theme.styles.noPadding,noMargin && theme.styles.noMargin]}>
                      {React.isValidElement(left)? left : typeof left =='function' ?left(leftRProps):null}
                      {icon && isLoading !== true ? (
                        <View style={[iconStyle,{color:textColor},iconProps.style]} testID={testID+"_IconContainer"}>
                          {React.isValidElement(icon)?icon : <Icon
                            testID={testID+"_Icon"}
                            source={icon}
                            {...iconProps}
                            size={iconSize}
                            disabled = {disabled}
                            onPress = {(e)=>{
                              if(iconProps.onPress && iconProps.onPress(e) === false){
                                  return;
                              }
                              if(onPress){
                                onPress(e);
                              }
                            }}
                            color={textColor}
                            style = {[
                                iconProps.style,
                                styles.icon,
                                ,notAllowedStyle
                            ]}
                          />}
                        </View>
                      ) : null}
                      {isLoading ? (
                        <ActivityIndicator
                          testID={testID+"_ActivityIndicator"}
                          {...loadingProps}
                          size={iconSize}
                          color={textColor}
                          style={[iconStyle,{marginRight:10},iconProps.style,loadingProps.style]}
                        />
                      ) : null}
                      <Label
                        selectable={false}
                        numberOfLines={1}
                        testID = {testID+"_Label"}
                        {...labelProps}
                        disabled = {disabled}
                        style={[
                          styles.label,
                          compact && styles.compactLabel,
                          upperCase && styles.upperCaseLabel,
                          textStyle,
                          labelProps.style,
                          labelStyle,
                          {color:textColor},
                        ]}
                      >
                        {children}
                      </Label>
                      {React.isValidElement(right)? right : typeof right === 'function'?right(leftRProps):null}
                    </View>
                  </TouchableRipple>
                </Surface>
           </View>
        }}
  </Tooltip>
});

const styles = StyleSheet.create({
  button: {
    //minWidth: 64,
    borderStyle: 'solid',
  },
  surfaceAlert : {
    marginLeft : 0,
    marginRight : 0,
  },
  elevationOnly : {
    padding : 10,
  },
  elevationAlert : {
    paddingHorizontal : 10,
    paddingVertical : 7,
    marginRight : 0,
  },
  elevation2icon : {
    paddingHorizontal : 5,
    paddingVertical : 1,
  },
  compact: {
    //minWidth: 'auto',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginLeft: 0,
    marginRight: 0,
    paddingVertical : 0,
    marginVertical : 0,
  },
  iconReverse: {
    marginRight: 0,
    marginLeft: 0,
  },
  label: {
    textAlign: 'center',
    fontWeight : '500',
    letterSpacing: 1,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  compactLabel: {
    marginHorizontal: 0,
  },
  upperCaseLabel: {
    textTransform: 'uppercase',
  },
});

ButtonComponent.displayName = "ButtonComponent";
export default theme.withStyles(ButtonComponent);

ButtonComponent.propTypes = {
    left : PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
    right : PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
    disableRipple : PropTypes.bool,//wheater ripple will be disabled
    mode : PropTypes.oneOf([
        'text','outlined', 'contained'
    ]),
    /**
     * Whether the color is a dark color. A dark button will render light text and vice-versa. Only applicable for `contained` mode.
     */
    dark : PropTypes.bool,
    /**
     * Use a compact look, useful for `text` buttons in a row.
     */
    compact:PropTypes.bool,
    /**
     * Custom text color for flat button, or background color for contained button.
     */
    color:PropTypes.string,
    /**
     * Whether to show a loading indicator.
     */
    loading:PropTypes.bool,
    /**
     * Icon to display for the `Button`.
     */
    icon : PropTypes.any,
    /**
     * Whether the button is disabled. A disabled button is greyed out and `onPress` is not called on touch.
     */
    disabled:PropTypes.bool,
    /**
     * Label text of the button.
     */
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ]),
    /**
     * Make the label text upperCased. Note that this won't work if you pass React elements as children.
     */
    upperCase:PropTypes.bool,
    /**
     * Accessibility label for the button. This is read by the screen reader when the user taps the button.
     */
    accessibilityLabel:PropTypes.string,
    /**
     * Function to execute on press.
     */
    onPress:PropTypes.func,
    /**
     * Function to execute on long press.
     */
    onLongPress:PropTypes.func,
    /**
     * Style of button's inner content.
     * Use this prop to apply custom height and width and to set the icon on the right with `flexDirection: 'row-reverse'`.
     */
    contentStyle:StylePropsTypes,
    style : StylePropsTypes,
    /**
     * Style for the button text.
     */
    labelStyle:StylePropsTypes,
    /**
     * @optional
     */
    theme: PropTypes.object,
    /**
     * testID to be used on tests.
     */
    testID:PropTypes.string,
    iconPosition : PropTypes.oneOf([
      'top','left','bottom','right'
    ]),
  }

  export const setIsLoading = (buttonRef,loading)=>{
    if(typeof buttonRef =='boolean'){
        const t = loading;
        loading = buttonRef;  
        buttonRef = t;      
    }
    if(typeof loading =='boolean' && buttonRef && buttonRef.current && typeof buttonRef.current.setIsLoading =='function'){
        buttonRef.current.setIsLoading(loading);
        return true;
    }
    return false;
}