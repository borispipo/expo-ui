import {Colors} from "$theme";
import React from 'react';
import View from "$ecomponents/View";
import {StyleSheet,ScrollView,TouchableWithoutFeedback} from 'react-native';
//import ScrollView from "$ecomponents/ScrollView";
import Label from "$ecomponents/Label";
import Icon from "$ecomponents/Icon"
import {defaultObj,isNonNullString,defaultStr} from "$utils";
import PropTypes from "prop-types";
import Item from "./Item";
import Surface from "$ecomponents/Surface";
import theme from "$theme";

const ExpandableComponent = React.forwardRef(({
  left,
  right,
  title,
  description,
  children,
  titleStyle,
  descriptionStyle,
  titleNumberOfLines = 1,
  descriptionNumberOfLines = 2,
  testID,
  onPress,
  onLongPress,
  expanded: expandedProp,
  accessibilityLabel,
  expandedIcon,
  expandIconProps,
  unexpandedIcon,
  leftProps,
  titleProps,
  noPadding,
  rightProps,
  descriptionProps,
  contentProps,
  centerProps,
  contentContainerProps,
  showExpandIcon,
  icon,
  containerProps,
  autoMountChildren = false,
  expandIconPosition,
  withScrollView = false,
  scrollViewProps,
  ...props
},ref) => {
  props = defaultObj(props);
  leftProps = defaultObj(leftProps)
  rightProps = defaultObj(rightProps);
  titleProps = defaultObj(titleProps);
  contentProps = defaultObj(contentProps);
  centerProps = defaultObj(centerProps),
  contentContainerProps = defaultObj(contentContainerProps);
  descriptionProps = defaultObj(descriptionProps);
  containerProps = defaultObj(containerProps);
  expandIconPosition = defaultStr(expandIconPosition,"right").toLowerCase().trim();
  const isIconPositionLeft = expandIconPosition =='left'? true : false;
  const isControlled = typeof expandedProp =='boolean'? true : false;
  const [expanded, setExpanded] = React.useState(isControlled ? expandedProp : false);
  const handlePressAction = (e) => {
    onPress?.({...React.getOnPressArgs(e),expanded:!expanded,checked:!expanded});
    if (!isControlled) {
       setExpanded((expanded) => !expanded);
    }
  };
  if(isControlled){
    React.useEffect(()=>{
      if(typeof expandedProp =='boolean' && expandedProp !== expanded){
        setExpanded(expandedProp)
      }
    },[expandedProp])
  }
  const titleColor = Colors.toAlpha(theme.colors.text,0.87);
  const descriptionColor = Colors.toAlpha(theme.colors.text,theme.ALPHA);
  const isExpanded = expanded ? true : false;
  titleProps.style = [styles.title,{color: isExpanded ? theme.colors.primary : titleColor},titleStyle,titleProps.style]
  const eProps = {color: isExpanded ? theme.colors.primary : descriptionColor}
  left = typeof left =='function'? left(eProps) : React.isValidElement(left)? left : null;
  right = typeof right =="function" ? right(eProps) : React.isValidElement(right)? right : null;
  if((isNonNullString(icon) || isObj(icon)) && !left){
    icon = isNonNullString(icon)? {icon} : icon;
    left = <Icon {...eProps} {...icon} />
  }
  if(!React.isValidElement(left)){
    left = null;
  }
  if(!React.isValidElement(right)){
    right = null;
  }
  testID = defaultStr(testID,"RN_ExpandableComponent");
  if(withScrollView){
    scrollViewProps = Object.assign({},scrollViewProps);
    children = <ScrollView vertical style={[{flex:1}]} {...scrollViewProps} testID={testID+"_ScrollView"}>
        {children}
    </ScrollView>
  }
  const expandIcon = showExpandIcon !== false ? <Icon
    color={titleColor}
    size={24}  
    {...defaultObj(expandIconProps)}
    icon = {isExpanded ? defaultVal(expandedIcon,"chevron-up") : defaultVal(unexpandedIcon,"chevron-down")}
    onPress = {handlePressAction}
  />:null;
  return ( <View testID={testID+"_ExpandableContainer"} {...containerProps}>
        <Surface {...props} ref={ref} testID={testID}>
          <TouchableWithoutFeedback
            delayPressIn={0}
            borderless = {false}  
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
            style={[styles.container,props.style]}
            onPress={handlePressAction}
            onLongPress={onLongPress}
            accessibilityState={{ expanded: isExpanded }}
            accessibilityLabel={accessibilityLabel}
            testID={testID+"_Container"}
          >
            <View testID={testID+'_ContentContainer'} {...contentContainerProps} style={[styles.row,theme.styles.cursorPointer,contentContainerProps.style]} pointerEvents1="none">
              {left || (expandIcon && isIconPositionLeft)
                ? <View testID={testID+'_Left'} {...leftProps} style={[styles.left]}>
                    {isIconPositionLeft ? expandIcon : null}
                    {left}
                </View>
                : null}
              <View testID={testID+'_Center'} {...centerProps} style={[styles.item, styles.content,styles.center,centerProps.style]}>
                {isNonNullString(title)? <Label
                  selectable={false}
                  numberOfLines={titleNumberOfLines}
                  {...titleProps}
                >
                  {title}
                </Label> : React.isValidElement(title)? title : null}
                {isNonNullString(description) ? (
                  <Label
                    testID={testID+'_Description'}
                    selectable={false}
                    numberOfLines={descriptionNumberOfLines}
                    {...descriptionProps}
                    style={[
                      styles.description,
                      {
                        color: descriptionColor,
                      },
                      descriptionStyle,
                      descriptionProps.style,
                    ]}
                  >
                    {description}
                  </Label>
                ) : null}
              </View>
              <View testID={testID+'_Right'} {...rightProps} style={[styles.item, description ? styles.multiline : undefined,styles.row,rightProps.style]}>
                {right}
                {!isIconPositionLeft ? expandIcon:null}
              </View>
            </View>
          </TouchableWithoutFeedback>
        {(autoMountChildren !== false || isExpanded) ? <View testID={testID+'_Content'} {...contentProps} 
          style={[{maxWidth:'100%'},styles.children,contentProps.style,!isExpanded && {opacity:0,height:0}]}
        >
            {children}
        </View> : null}
      </Surface>
    </View>
  );
});

ExpandableComponent.displayName = 'ExpandableComponent';

const styles = StyleSheet.create({
  center : {
    justifyContent : 'flex-start',
  },
  container: {
    padding: 8,
  },
  left : {
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center'
  },
  multiline: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    paddingHorizontal:10,
  },
  description: {
    fontSize: 14,
  },
  item: {
    margin:0,
  },
  child: {
    paddingLeft: 64,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  children : {
    marginLeft : 8,
  }
});

ExpandableComponent.propTypes = {
    left : PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
    right : PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
    expandIconPosition : PropTypes.oneOf([
      'left','right'
    ]),
    withScrollView : PropTypes.bool,///si le contenu sera rendu avec le scrollView
    autoMountChildren : PropTypes.bool,///si les enfants du composant seront montés mais masqués et lorsqu'on cliquera sur toggle ceux-ci seront affichés
    leftProps : PropTypes.object, ///les props à paser à la vue qui rend le contenu gouche
    rightProps : PropTypes.object, ///les props à passer à la vue qui rend le contenu droit
    descriptionProps : PropTypes.object,///les props à passer à la valeur de la description de l'expandable

}

ExpandableComponent.Item = Item;

export default ExpandableComponent;
