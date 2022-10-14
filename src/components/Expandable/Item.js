import color from 'color';
import * as React from 'react';
import {defaultObj,defaultStr} from "$utils";
import Label from "$components/Label"
import theme from "$theme";
import View from "$components/View";
import {
  StyleSheet,
} from 'react-native';

import {TouchableRipple,withTheme} from "react-native-paper";

const ExpandableItem = ({left,right,title,description,
  onPress,
  style,
  titleStyle,
  titleNumberOfLines = 1,
  descriptionNumberOfLines = 2,
  titleEllipsizeMode,
  descriptionEllipsizeMode,
  descriptionStyle,
  leftProps,
  rightProps,
  titleProps,
  contentProp,
  containerProps,
  descriptionProps,
  testID,
  ...rest
}) => {
  leftProps = defaultObj(leftProps);
  rightProps = defaultObj(rightProps);
  titleProps = defaultObj(titleProps);
  contentProp = defaultObj(contentProp);
  containerProps = defaultObj(containerProps);
  descriptionProps = defaultObj(descriptionProps);
  testID = defaultStr(testID,"RN_ExpandableItemComponent")
  const renderDescription = (descriptionColor,description) => {
    return typeof description === 'function' ? (description({
        selectable: false,
        ellipsizeMode: descriptionEllipsizeMode,
        color: descriptionColor,
        fontSize: styles.description.fontSize,
      })
    ) : (
      <Label
        selectable={false}
        numberOfLines={descriptionNumberOfLines}
        ellipsizeMode={descriptionEllipsizeMode}
        testID = {testID+"_Description"}
        {...descriptionProps}
        style={[
          styles.description,
          { color: descriptionColor },
          descriptionStyle,
          descriptionProps.style
        ]}
      >
        {description}
      </Label>
    );
  };

  const renderTitle = () => {
    const titleColor = color(theme.colors.text).alpha(0.87).rgb().string();

    return typeof title === 'function' ? (
      title({
        selectable: false,
        ellipsizeMode: titleEllipsizeMode,
        color: titleColor,
        fontSize: styles.title.fontSize,
      })
    ) : (
      <Label
        selectable={false}
        ellipsizeMode={titleEllipsizeMode}
        numberOfLines={titleNumberOfLines}
        testID = {testID+'_Title'}
        {...titleProps}
        style={[styles.title, { color: titleColor }, titleStyle,titleProps.style]}
      >
        {title}
      </Label>
    );
  };
  
  const descriptionColor = color(theme.colors.text).alpha(theme.ALPHA).rgb().string();
  left  = typeof left =='function'? left ({
      color: descriptionColor,
      style: description
      ? styles.iconMarginLeft
      : {
          ...styles.iconMarginLeft,
          ...styles.marginVerticalNone,
        },
  }) : React.isValidElement(left)? left : null;
  right = typeof right =='function'? right ({
    color: descriptionColor,
    style: description
      ? styles.iconMarginRight
      : {
          ...styles.iconMarginRight,
          ...styles.marginVerticalNone,
        },
}): React.isValidElement(right)? right : null;

  return (<TouchableRipple
                {...rest}
                testID = {testID}
                style={[styles.container, style]}
                onPress={onPress}
            >
              <View testID={testID+'_Container'} {...containerProps} style={[styles.row,containerProps.style]}>
                {left ? <View testID={testID+'_Left'} {...leftProps} style={[leftProps.style]}>
                      {left}
                  </View>: null}
                <View testID={testID+'_Content'} {...contentProp} style={[styles.item, styles.content,contentProp.style]}>
                  {renderTitle()}
                  {description ? renderDescription(descriptionColor, description): null}
                </View>
                {right  ? <View testID={testID+'_Right'} {...rightProps} style={[rightProps.style]}>
                        {right}
                  </View>
                  : null}
              </View>
        </TouchableRipple>);
};

ExpandableItem.displayName = 'ExpandableItem';

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems : 'center',
    justifyContent : "center",
  },
  title: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
  },
  marginVerticalNone: { marginVertical: 0 },
  iconMarginLeft: { marginLeft: 0, marginRight: 16 },
  iconMarginRight: { marginRight: 0 },
  item: {
    marginVertical: 6,
    paddingLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
export default ExpandableItem;
