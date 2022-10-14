import Logo from "$ecomponents/Logo";
import Link from "$ecomponents/Link";
import Icon from "$ecomponents/Icon";
import Divider from "$ecomponents/Divider";
import PrivacyPolicyLink from "./PrivacyPolicy/Link";
import TermsOfUsesLink from "./TermsOfUses/Link";
import openLibraries from "./openLibraries";
import {isNativeDesktop,isAndroid,isIos} from "$cplatform";
import Expandable from "$ecomponents/Expandable";
import React from "$react";
import Screen from "$escreen";
import getDevicesInfos from "./getDevicesInfos";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import {isNonNullString,defaultStr} from "$utils";
import {isMobileMedia} from "$cdimensions";
import theme from "$theme";
import APP from "$capp";
import AutoLink from "$ecomponents/AutoLink";
import Grid from "$ecomponents/Grid";
import getReleaseText from "./getReleaseText";

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
    const gridStyles = [{width:40,padding:gridPadding},{width:'60%',padding:gridPadding},{width:60,padding:gridPadding},{width:40,padding:gridPadding}];
    const borderStyle = {borderColor:theme.colors.divider,borderWidth:1};
    return <Screen withScrollView title={title} {...props}>
        <View style={[theme.styles.alignItemsCenter,theme.styles.w100,theme.styles.p1]}>
            <Logo  style={{marginRight:10}}/>
            {getReleaseText()}
            <Divider style={[theme.styles.mv1]}/>
            <View style = {[theme.styles.row]}>
                {icon && iconText ? <Icon name={icon} primary title={"Ce périférique est "+iconText} /> : null}
            </View>
            <View style={theme.styles.pb2}>
                {deviceInfo}
            </View>
            <View>
                <Label style={theme.styles.p05}>{APP.getCopyright()}</Label>
                <AutoLink style={[theme.styles.row]}
                    email = {APP.getDevMail()} 
                >
                    <Label>Nous contacter : </Label>
                    <Label primary textBold>{APP.getDevMail()}</Label>
                </AutoLink>
                <TermsOfUsesLink style={theme.styles.mv05} children="CONTRAT DE LICENCE."/>
                <PrivacyPolicyLink style={theme.styles.mv05} children="POLITIQUE DE CONFIDENTIALITE."/>
                <Link routeName={"releaseNotes"}>
                    <Label primary textBold style={theme.styles.mv05} >{APP.getName()+", Notes de mise à jour."}</Label>
                </Link>
            </View>
            <View style={[theme.styles.w100]}>
                <Expandable
                    title = {"A propos des librairies tiers"}
                    titleProps = {{style:theme.styles.ph1}}
                    style = {{backgroundColor:'transparent'}}
                >
                    <View style={[theme.styles.row,theme.styles.flexWrap]}>
                        <Label primary textBold>{APP.getName()+"   "}</Label>
                        <Label>est bâti sur un ensemble d'outils et librairies open Source</Label>
                    </View>
                    <View style={[theme.styles.w100,theme.styles.pv1]}>
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
            </View>
        </View>
    </Screen>  
}   

export const title = HelpScreen.title = "A propos";

export const screenName = HelpScreen.screenName = "Help/About";

HelpScreen.AuthRequired = false;

HelpScreen.Modal = true;