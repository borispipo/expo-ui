import {View,StyleSheet} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from "$react";
export default function AppEntryRootView({MainProvider,...props}){
    const Wrapper = React.isComponent(MainProvider)? MainProvider : React.Fragment;
    const insets = useSafeAreaInsets();
    return <Wrapper>
        <View
            testID="RN_MainAppEntryRootView"
            {...props}
            style = {StyleSheet.flatten([
            {
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
              },
            props.style,{flex:1}])}
        />
    </Wrapper>
}