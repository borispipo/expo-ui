import Logo from "$ecomponents/Logo";
import Link from "$ecomponents/Link";
import Icon from "$ecomponents/Icon";
import Divider from "$ecomponents/Divider";
import PrivacyPolicyLink from "./PrivacyPolicy/Link";
import TermsOfUsesLink from "./TermsOfUses/Link";
import {isNativeDesktop,isAndroid,isIos} from "$platform";
import React from "$react";
import Screen from "$screen";
import getDevicesInfos from "./getDevicesInfos";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import {defaultStr} from "$cutils";
import theme from "$theme";
import APP from "$app";
import AutoLink from "$ecomponents/AutoLink";
import getReleaseText from "./getReleaseText";
import appConfig from "$capp/config";
import OpenLibraries from "./OpenLibraryScreen";

export default function HelpScreen(props){
    const deviceInfo = getDevicesInfos();
    let icon = undefined, iconText = undefined;
    let device = APP.DEVICE;
    let operatingSystem  = defaultStr(device.operatingSystem).toLowerCase();
    let isLaptop = device.isLaptop;
    if(isLaptop){
        icon = "laptop";
        iconText = "un ordinateur portable"
    }
    if(isAndroid()){
        icon = "android";
        iconText = "un téléphone Android";
    } else if(isIos()){
        icon = "apple-ios";
        iconText = "un iphone";
    } else if(isNativeDesktop() && operatingSystem){
        if(!isLaptop){
            icon = "desktop-classic";
            iconText = "un ordinateur de bureau";    
        }
        if(operatingSystem.contains("linux")){
            if(!isLaptop){
                icon = "linux";
            }
            iconText += " sur lequel est installé une distribution linux";
        } else if(operatingSystem.contains("windows")){
            icon = isLaptop ? "laptop" : "windows";
            iconText += (isLaptop?" window":"")+ " sur lequel est installé le système windows";
        } else {
            icon = isLaptop ? "laptop" : "desktop-classic";
            iconText += " Mac os";
        }
    }
    const testID = defaultStr(props.testID,"RN_HelpAboutScreenComponent")
    return <Screen  withScrollView title={title} {...props} testID={testID+"_Screen"} contentContainerStyle={[{flex:1},theme.styles.alignItemsCenter,theme.styles.justifyContentCenter]}>
        <View testID={testID+"_Container"} style={[theme.styles.alignItemsCenter,theme.styles.justifyContentCenter,theme.styles.w100,theme.styles.p1]}>
            <Logo  testID={testID+"_Logo"} style={{marginRight:10}}/>
            {getReleaseText()}
            <Divider testID={testID+"_Divider1"} style={[theme.styles.mv1]}/>
            <View testID={testID+"_IconText"} style = {[theme.styles.row]}>
                {icon && iconText ? <Icon name={icon} primary title={"Ce périférique est "+iconText} /> : null}
            </View>
            <View testID={testID+"_DeviceInfos"} style={theme.styles.pb2}>
                {deviceInfo}
            </View>
            <View testID={testID}>
                <Label testID={testID+"_CopyRight"} style={theme.styles.pv05}>{appConfig.copyright}</Label>
                {appConfig.devMail? <AutoLink testID={testID+"_Email"} style={[theme.styles.row]}
                    email = {appConfig.devMail} 
                >
                    <Label>Nous contacter : </Label>
                    <Label primary textBold>{appConfig.devMail}</Label>
                </AutoLink>:null}
                <TermsOfUsesLink testID={testID+"_TemrsOfUsesLink"} style={theme.styles.mv05} children="CONTRAT DE LICENCE."/>
                <PrivacyPolicyLink testID={testID+"_PrivacyPolicyLink"} style={theme.styles.mv05} children="POLITIQUE DE CONFIDENTIALITE."/>
                <Link routeName={"releaseNotes"}>
                    <Label primary textBold style={theme.styles.mv05} >{appConfig.name+", Notes de mise à jour."}</Label>
                </Link>
            </View>
            <View testID={testID+"_OpenLibrariesLinkContainer"} style={[theme.styles.w100,theme.styles.justifyContentCenter,theme.styles.alignItemsCenter]}>
                <OpenLibraries.Link testID={testID+"_OpenLibrariesLink"}/>
            </View>
        </View>
    </Screen>  
}   

export const title = HelpScreen.title = "A propos";

export const screenName = HelpScreen.screenName = "Help/About";

HelpScreen.authRequired = false;

HelpScreen.Modal = true;