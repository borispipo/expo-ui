import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import theme from "$theme";
import appConfig from "$capp/config";
export default function getReleaseLabel(){
    return <View style={[theme.styles.row]}>
        <Label style={[{color:theme.colors.text,fontSize:16}]}>Version </Label>
        <Label style={[{color:theme.colors.primary,fontWeight:'bold',fontSize:18}]}>{appConfig.version} </Label>
    </View>;
}