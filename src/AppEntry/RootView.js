import {View,StyleSheet} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function AppEntryRootView(props){
    const insets = useSafeAreaInsets();
    console.log(insets," is inseetts");
    return <View
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
}