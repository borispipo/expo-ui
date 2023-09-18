import ActivityIndicator from "$ecomponents/ActivityIndicator";
import View from "$ecomponents/View";
import theme from "$theme";
export default function ScreenLoadingActivityIndicator({...props}){
    return <View testID={"MainScreenWrapperLoadingIndicator"} style={[theme.alignItemsCenter,theme.justifyContentCenter]}>
        <ActivityIndicator/>
    </View>
}