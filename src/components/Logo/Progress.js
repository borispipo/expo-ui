import Logo from "./Logo";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import { ActivityIndicator, Colors } from 'react-native-paper';
import theme,{defaultDarkTheme} from "$theme";
import {isIos} from "$cplatform";
import appConfig from "$capp/config";

export default function LogoProgress (props){
    let containerStyle = {width:(Logo.width?Logo.width:undefined),height:(Logo.height?(Logo.height+100):undefined),flex:1,alignItems:"center",justifyContent:"center"};
    const isLight = theme.isLight();
    let primaryColor = isLight?theme.colors.primaryOnSurface : defaultDarkTheme.colors.primary, 
    secondaryColor = isLight ? theme.colors.secondaryOnSurface : defaultDarkTheme.colors.secondary;
    return <View style={[containerStyle]}>
            <Logo key='logo' style={{marginBottom:0}} color={primaryColor}/>
            <ActivityIndicator size = {isIos()?'large':40} animating={true} color={secondaryColor} />
            <View key={'app-version'} style={{flex:1}}>
                <Label style={[{marginTop:10, fontWeight:'bold',color:secondaryColor}]}>version {appConfig.version}</Label>
            </View>
    </View>
}