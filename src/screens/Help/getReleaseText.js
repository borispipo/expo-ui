import View from "$components/View";
import Label from "$components/Label";
import theme from "$theme";
import appConfig from "$app/config";

export default function getReleaseLabel(){
    return <View style={[theme.styles.row]}>
        <Label style={[{color:theme.colors.text,fontSize:16}]}>Version </Label>
        <Label style={[{color:theme.colors.primary,fontWeight:'bold',fontSize:18}]}>{appConfig.version} </Label>
    </View>;
}