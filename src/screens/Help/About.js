import Logo from "$ecomponents/Logo";
import Link from "$ecomponents/Link";
import Icon from "$ecomponents/Icon";
import Divider from "$ecomponents/Divider";
import PrivacyPolicyLink from "./PrivacyPolicy/Link";
import TermsOfUsesLink from "./TermsOfUses/Link";
import {isNativeDesktop,isAndroid,isIos} from "$platform";
import Expandable from "$ecomponents/Expandable";
import React from "$react";
import Screen from "$screen";
import getDevicesInfos from "./getDevicesInfos";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import {defaultStr} from "$utils";
import theme from "$theme";
import APP from "$app";
import AutoLink from "$ecomponents/AutoLink";
import Grid from "$ecomponents/Grid";
import getReleaseText from "./getReleaseText";
import appConfig from "$capp/config";
let openLibraries = null;
try {
    openLibraries = require("./openLibraries");
} catch{
    openLibraries = null;
}
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
    const gridPadding = 5;
    const gridStyles = [{width:40,padding:gridPadding},{width:'60%',padding:gridPadding},{width:60,padding:gridPadding},{width:60,padding:gridPadding}];
    const borderStyle = {borderColor:theme.colors.divider,borderWidth:1,justifyContent:'space-between'};
    const testID = defaultStr(props.testID,"RN_HelpAboutScreenComponent")
    return <Screen  withScrollView title={title} {...props} testID={testID+"_Screen"}>
        <View testID={testID+"_Container"} style={[theme.styles.alignItemsCenter,theme.styles.justifyContentCenter,theme.styles.flex1,theme.styles.w100,theme.styles.p1]}>
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
            {Object.size(openLibraries,true) ? <View style={[theme.styles.w100]}>
                <Expandable
                    testID={testID+"_OpenLibraries"}
                    title = {"A propos des librairies tiers"}
                    titleProps = {{style:theme.styles.ph1}}
                    style = {{backgroundColor:'transparent'}}
                >
                    <View testID={testID+"_OpenLibraries_Header"} style={[theme.styles.row,theme.styles.flexWrap]}>
                        <Label testID={testID+"_OpenLibraries_HeaderLabel"} primary textBold>{appConfig.name+"   "}</Label>
                        <Label>est bâti sur un ensemble d'outils et librairies open Source</Label>
                    </View>
                    <View testID={testID+"_OpenLibrariesContent"} style={[theme.styles.w100,theme.styles.pv1]}>
                        <Grid.Row style={borderStyle}>
                            <Label style={gridStyles[0]} textBold>#</Label>
                            <Label style={gridStyles[1]} textBold>Librairie/Outil</Label>
                            <Label style={gridStyles[2]} textBold>Version</Label>
                            <Label style={gridStyles[3]} textBold>Licence</Label>
                        </Grid.Row>
                        {Object.mapToArray(openLibraries,(lib,i,_i)=>{
                            return <Grid.Row key={i} style={borderStyle}>
                                <Label style={gridStyles[0]}>
                                    {_i.formatNumber()}
                                </Label>
                                <AutoLink style={gridStyles[1]} url={lib.url}>
                                    <Label splitText>{i}</Label>
                                </AutoLink>
                                <AutoLink style={gridStyles[2]}>
                                    <Label splitText numberOfLines={2}>{defaultStr(lib.version)}</Label>
                                </AutoLink>
                                <AutoLink url={lib.licenseUrl} style={gridStyles[3]}>
                                    <Label splitText>{lib.license}</Label>
                                </AutoLink>
                            </Grid.Row>
                        })}
                    </View>
                </Expandable>
            </View>: null}
        </View>
    </Screen>  
}   

export const title = HelpScreen.title = "A propos";

export const screenName = HelpScreen.screenName = "Help/About";

HelpScreen.AuthRequired = false;

HelpScreen.Modal = true;