import Logo from "./Logo";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import { ActivityIndicator, Colors } from 'react-native-paper';
import theme,{defaultDarkTheme} from "$theme";
import {isIos} from "$cplatform";
import appConfig from "$capp/config";
import {defaultStr} from "$cutils";

export default function LogoProgress ({testID}){
    testID = defaultStr(testID,"RN_LogoProgress");
    let containerStyle = {width:(Logo.width?Logo.width:undefined),height:(Logo.height?(Logo.height+100):undefined),flex:1,alignItems:"center",justifyContent:"center"};
    const primaryColor = theme.colors.primaryOnSurface,
    secondaryColor = theme.colors.secondaryOnSurface;
    return <View style={[containerStyle]} testID={testID+"_ProgressLogoContainer"}>
            <Logo key='logo' style={{marginBottom:0}} color={primaryColor} testID={testID+"_ProgressLogo"}/>
            <View style={{marginTop:20}} testID={testID+"_LogoProgressActivityIndicatorContainer"}>
                <ActivityIndicator size = {isIos()?'large':40} animating={true} color={secondaryColor} />
            </View>
            <View key={'app-version'} style={{flex:1}} testID={testID+"_LogoProgressVersion"}>
                <Label style={[{marginTop:10, fontWeight:'bold',color:secondaryColor}]}>version {appConfig.version}</Label>
            </View>
    </View>
}