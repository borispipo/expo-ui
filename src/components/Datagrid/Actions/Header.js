import React from "$react";
import {StyleSheet} from "react-native";
import {defaultStr} from "$utils";
import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import theme from "$theme";
import Surface from "$ecomponents/Surface";

export const selectedBackgroundColor = '#fee0eb';

const selectedTitle ='#f50057';

export const getSelectedBackgroundColor = x=> theme.isDark()?theme.colors.surface : selectedBackgroundColor;

export default function DatagridActionsHeaderComponent({title,selected,testID,children,style,pointerEvents,...props}) {
  title = defaultStr(title);
  const bStyle = selected && theme.isDark()? {
    borderBottomColor : theme.colors.divider,
    borderTopColor : theme.colors.divider,
    borderBottomWidth : 1,
    borderTopWidth : 1,
  } : null;
  testID = defaultStr(testID,"RN_DatagridHeaderSurface");
  return (
    <Surface testID={testID} elevation={selected ? 5:0} style={[style,bStyle,title?styles.container:styles.right,styles.row,{backgroundColor:selected?getSelectedBackgroundColor():'transparent'}]} pointerEvents={pointerEvents}>
      {title ? <Label testID={testID+"Label"} style={[styles.title,selected?[styles.selectedTitle,{color:!theme.isDark()?selectedTitle:theme.colors.primaryOnSurface}]:undefined]}>
        {title}
      </Label> : null}
      {React.isValidElement(children) && <View testID={testID+"_Content"} style={[styles.children,styles.row]}>
        {children}
      </View>}
    </Surface>
  );
}

const styles = StyleSheet.create({
  row : {
    flexDirection : 'row',
    justifyContent:'space-between',
    alignItems : 'center',
  },
  container : {
     paddingVertical : 0,
     height : 50,
     paddingHorizontal : 10,
  },
  selectedTitle : {
    fontWeight : 'bold',
  },
  title : {
    //fontSize : 14
  },
  right : {
    textAlign : 'right',
    alignSelf : 'flex-end',
    height : 50,
  }
})