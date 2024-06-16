import { ActivityIndicator } from "react-native";
import theme from "$theme";
export default function ActivityIndicatorComponent(props : any){
    return <ActivityIndicator
        testID="RN_ActivityIndicatorComponent"
        color={theme.colors.primary}
        {...props}
    />
}