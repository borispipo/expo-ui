import * as React from 'react';
import {
  StyleSheet,
  Animated,
  SafeAreaView,
  TouchableWithoutFeedback
} from 'react-native';
import View from "$ecomponents/View";
import {FAB,Text,Card,withTheme} from "react-native-paper";
import colorFn from 'color';
import PropTypes from "prop-types";
import Action from "$ecomponents/Form/Action";
import theme,{ disabledStyle,StylePropTypes,cursorPointer,Colors,cursorNotAllowed } from '$theme';
import {defaultStr} from "$cutils";



const FABGroup = ({
  actions,
  isFormAction,
  icon,
  open,
  onPress,
  label,
  style,
  screenName,
  fabStyle,
  visible,
  onStateChange,
  color: colorProp,
  testID,
  ...rest
}) => {
  testID = defaultStr(testID,"RN_FabGroupComponent")
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

  const colors = theme.colors;

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
    <View testID={testID+"_Container"} style={[styles.container, style]}>
      <TouchableWithoutFeedback testID={testID+"_TouchableOpacity"} onPress={close}>
        <Animated.View
          testID={testID+"_AnimatedView"}
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: colors.backdrop,
              pointerEvents : open ? 'auto' : 'none',
            },
          ]}
        />
      </TouchableWithoutFeedback>
      <SafeAreaView testID={testID+"_SafeAreaView"} style={styles.safeArea}>
        <View testID={testID+"_ItemsContainer"} style={[styles.itemsContainer,{pointerEvents:open ? 'box-none' : 'none'}]}>
          {actions.map((it, i) => {
             const itemProps = {
                ...it,
                open,
                scale:scales[i],
                opacity : opacities[i],
                close,
             }
             return (
              <View
                testID={testID+"_Item_"+i}
                key={i} // eslint-disable-line react/no-array-index-key
                style={[
                  styles.item,
                  {
                    marginHorizontal:
                      typeof it.small || it.small ? 24 : 16,
                      pointerEvents : open ? 'box-none' : 'none',
                  },
                ]}
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
          // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
          accessibilityTraits="button"
          accessibilityComponentType="button"
          //role="button"
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
  "aria-label" : PropTypes.string,
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


const _FabItem = function({children,label,disabled:customDisabled,pointerEvents,open,close,testID:customTestID,labelStyle,icon,backgroundColor,scale,opacity,color,style,small,onPress,...rest}){
  const disabled = typeof customDisabled =='boolean'? customDisabled : false;
  const testID = defaultStr(customTestID,"RN_FabItemComponent")
  style = StyleSheet.flatten(style) || {};
  color = Colors.isValid(color)? color : style.color;
  backgroundColor = Colors.isValid(backgroundColor)? backgroundColor : style.backgroundColor;
  const cursorStyle = disabled? cursorNotAllowed : cursorPointer;
  const _onPress = ()=>{
    if(onPress){
      onPress();
    }
    close();
  }
  const dStyle = disabled ? disabledStyle : null;
  return <>
       {label ? (
         <View testID = {testID+"_LabelContainer"} style={[dStyle,{pointerEvents}]}>
               <Card
                testID={testID+"_Card"}
                 style={
                   [
                     styles.label,
                     labelStyle,
                     {
                       transform: [{ scale }],
                       opacity,
                       backgroundColor,
                     },
                   ] 
                 }
                 onPress={_onPress}
                 aria-label ={
                   rest["aria-label"] !== 'undefined'
                     ? rest["aria-label"]
                     : label
                 }
                 accessibilityTraits="button"
                 accessibilityComponentType="button"
                 //role="button"
               >
                 <Text testID={testID+"_Label"} style={StyleSheet.flatten([{ color},cursorStyle])}>
                   {label}
                 </Text>
               </Card>
             </View>
           ) : null}
           <FAB
             small={typeof small =='boolean' ? small : true}
             icon={icon}
             color={color}
             disabled = {disabled}
             style={
               [
                 style,
                 dStyle,
                 cursorStyle,
                 {
                  transform: [{ scale}],
                  opacity,
                  backgroundColor,
                  pointerEvents,
                },
               ] 
             }
             onPress={_onPress}
             aria-label={
               typeof rest["aria-label"] !== 'undefined'
                 ? rest["aria-label"]
                 : label
             }
             // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
             accessibilityTraits="button"
             accessibilityComponentType="button"
             //role="button"
             testID={testID}
             visible={open}
        />
  </>
}

export const FabItem = theme.withStyles(_FabItem,{displayName:"FabItemComponent",mode:"contained"});
const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'flex-end',
    pointerEvents : "box-none",
  },
  itemsContainer : {
    marginBottom : 70,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents : "box-none",
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