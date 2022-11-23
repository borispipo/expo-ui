import * as React from 'react';
import {
  StyleSheet,
  Animated,
  SafeAreaView,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import View from "$ecomponents/View";
import {FAB,Text,Card,withTheme} from "react-native-paper";
import color from 'color';
import PropTypes from "prop-types";
import { StylePropTypes } from '$theme';
import Action from "$ecomponents/Form/Action";
import { disabledStyle,cursorNotAllowed } from '$theme';
import {defaultStr} from "$utils";



const FABGroup = ({
  actions,
  isFormAction,
  icon,
  open,
  onPress,
  accessibilityLabel,
  theme,
  label,
  style,
  screenName,
  fabStyle,
  visible,
  testID,
  onStateChange,
  color: colorProp,
  ...rest
}) => {
  
  const { current: backdrop } = React.useRef(
    new Animated.Value(0)
  );
  const animations = React.useRef(
    actions.map(() => new Animated.Value(open ? 1 : 0))
  );

  const [prevActions, setPrevActions] = React.useState(null);

  const { scale } = theme.animation;

  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 250 * scale,
          useNativeDriver: true,
        }),
        Animated.stagger(
          50 * scale,
          animations.current
            .map((animation) =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 150 * scale,
                useNativeDriver: true,
              })
            )
            .reverse()
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200 * scale,
          useNativeDriver: true,
        }),
        ...animations.current.map((animation) =>
          Animated.timing(animation, {
            toValue: 0,
            duration: 150 * scale,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }, [open, actions, backdrop, scale]);

  const close = () => onStateChange({ open: false });

  const toggle = () => onStateChange({ open: !open });

  const { colors } = theme;

  const labelColor = theme.dark
    ? colors.text
    : color(colors.text).fade(theme.ALPHA).rgb().string();
  const backdropOpacity = open
    ? backdrop.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 1],
      })
    : backdrop;

  const opacities = animations.current;
  const scales = opacities.map((opacity) =>
    open
      ? opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        })
      : 1
  );

  if (actions.length !== prevActions?.length) {
    animations.current = actions.map(
      (_, i) => animations.current[i] || new Animated.Value(open ? 1 : 0)
    );
    setPrevActions(actions);
  }
  const Item = isFormAction ? Action : FabItem;
  const itemComponentProps = isFormAction ? {Component : FabItem} : {};
  return (
    <View pointerEvents="box-none" style={[styles.container, style]}>
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          pointerEvents={open ? 'auto' : 'none'}
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: colors.backdrop,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
        <View pointerEvents={open ? 'box-none' : 'none'}>
          {actions.map((it, i) => {
             const itemProps = {
                labelColor : it.labelTextColor ??  it.labelColor ?? labelColor,
                backgroundColor : theme.colors.surface,
                ...it,
                open,
                scale:scales[i],
                opacity : opacities[i],
                close,
             }
             return (
              <View
                key={i} // eslint-disable-line react/no-array-index-key
                style={[
                  styles.item,
                  {
                    marginHorizontal:
                      typeof it.small === 'undefined' || it.small ? 24 : 16,
                  },
                ]}
                pointerEvents={open ? 'box-none' : 'none'}
              >
                <Item
                  {...itemProps}
                  {...itemComponentProps}
                />
              </View>
            )
          })}
        </View>
        <FAB
          small = {false}
          {...defaultObj(rest)}
          onPress={() => {
            onPress?.();
            toggle();
          }}
          label = {label}
          icon={icon}
          color={colorProp}
          accessibilityLabel={accessibilityLabel}
          // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
          accessibilityTraits="button"
          accessibilityComponentType="button"
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          style={StyleSheet.flatten([styles.fab, fabStyle])}
          visible={visible}
          testID={testID}
        />
      </SafeAreaView>
    </View>
  );
};

FABGroup.displayName = 'FAB.Group';

export default withTheme(FABGroup);

// @component-docs ignore-next-line
const FABGroupWithTheme = withTheme(FABGroup);
// @component-docs ignore-next-line
export { FABGroupWithTheme as FABGroup };


FABGroup.propTypes = {
   isFormAction : PropTypes.bool,
    /**
   * Action items to display in the form of a speed dial.
   * An action item should contain the following properties:
   * - `icon`: icon to display (required)
   * - `label`: optional label text
   * - `accessibilityLabel`: accessibility label for the action, uses label by default if specified
   * - `color`: custom icon color of the action item
   * - `labelTextColor`: custom label text color of the action item
   * - `style`: pass additional styles for the fab item, for example, `backgroundColor`
   * - `labelStyle`: pass additional styles for the fab item label, for example, `backgroundColor`
   * - `small`: boolean describing whether small or normal sized FAB is rendered. Defaults to `true`
   * - `onPress`: callback that is called when `FAB` is pressed (required)
   */
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon:  PropTypes.any,
    label: PropTypes.string,
    color: PropTypes.string,
    labelTextColor: PropTypes.string,
    accessibilityLabel: PropTypes.string,
    style: StylePropTypes,
    labelStyle: StylePropTypes,
    small: PropTypes.bool,
    onPress: PropTypes.func,
    testID: PropTypes.string,
  })),
  /**
   * Icon to display for the `FAB`.
   * You can toggle it based on whether the speed dial is open to display a different icon.
   */
  icon: PropTypes.any,
  /**
   * Accessibility label for the FAB. This is read by the screen reader when the user taps the FAB.
   */
  accessibilityLabel: PropTypes.string,
  /**
   * Custom color for the `FAB`.
   */
  color: PropTypes.string,
  /**
   * Function to execute on pressing the `FAB`.
   */
  onPress : PropTypes.func,
  /**
   * Whether the speed dial is open.
   */
  open: PropTypes.bool,
  /**
   * Callback which is called on opening and closing the speed dial.
   * The open state needs to be updated when it's called, otherwise the change is dropped.
   */
  onStateChange: PropTypes.func,
  /**
   * Whether `FAB` is currently visible.
   */
  visible: PropTypes.bool,
  /**
   * Style for the group. You can use it to pass additional styles if you need.
   * For example, you can set an additional padding if you have a tab bar at the bottom.
   */
  style: StylePropTypes,
  /**
   * Style for the FAB. It allows to pass the FAB button styles, such as backgroundColor.
   */
  fabStyle: StylePropTypes,
  /**
   * @optional
   */
  theme: PropTypes.object,
  /**
   * Pass down testID from Group props to FAB.
   */
  testID: PropTypes.string,
}


export const FabItem = function(props){
  const {children,label,disabled:customDisabled,pointerEvents,open,close,testID:customTestID,labelStyle,labelColor,accessibilityLabel,icon,backgroundColor,scale,opacity,color,style,small,onPress,...rest} = props;
  const disabled = typeof customDisabled =='boolean'? customDisabled : false;
  const testID = defaultStr(customTestID,"RN_FabGroupComponent")
  const _onPress = ()=>{
    if(onPress){
      onPress();
    }
    close();
  }
  const dStyle = disabled ? disabledStyle : null;
  return <>
       {label ? (
         <View testID = {testID+"_LabelContainer"} style={dStyle} pointerEvents={pointerEvents}>
               <Card
                testID={testID+"_Card"}
                 style={
                   [
                     styles.label,
                     {
                       transform: [{ scale }],
                       opacity,
                     },
                     labelStyle,
                   ] 
                 }
                 onPress={_onPress}
                 accessibilityLabel={
                   accessibilityLabel !== 'undefined'
                     ? accessibilityLabel
                     : label
                 }
                 accessibilityTraits="button"
                 accessibilityComponentType="button"
                 accessibilityRole="button"
               >
                 <Text testID={testID+"_Label"} style={{ color : labelColor }}>
                   {label}
                 </Text>
               </Card>
             </View>
           ) : null}
           <FAB
             small={typeof small !== 'undefined' ? small : true}
             icon={icon}
             color={color}
             disabled = {disabled}
             pointerEvents={pointerEvents}
             style={
               [
                 {
                   transform: [{ scale}],
                   opacity,
                   backgroundColor,
                 },
                 style,
                 dStyle,
                 disabled? cursorNotAllowed : null,
               ] 
             }
             onPress={_onPress}
             accessibilityLabel={
               typeof accessibilityLabel !== 'undefined'
                 ? accessibilityLabel
                 : label
             }
             // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
             accessibilityTraits="button"
             accessibilityComponentType="button"
             accessibilityRole="button"
             testID={testID}
             visible={open}
        />
  </>
}

const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'flex-end',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  fab: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  item: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});