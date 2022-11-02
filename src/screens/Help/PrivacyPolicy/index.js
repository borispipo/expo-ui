import {PRIVACY_POLICY} from "./routes";
import title from "./title"
import  Screen  from "$screen";
import Link from "./Link";
import Content from "$PrivacyPolicy";
import {getScreenProps} from "$cnavigation";
import React from "$react";

export default function PrivacyPolicy(p){
    const props = getScreenProps(p);
    return <Screen 
        {...props}
        withDrawer = {false}
        appBarProps  = {extendObj({},{
            backAction : false,
            title,
            actions : [{
                text : "Accepter",
                icon : "check",
                onPress : ({goBack})=>{
                    goBack && goBack();
                }
            }],
        }, props.appBarProps)}
    >
        {React.isComponent(Content)? <Content {...props}/> : React.isValidElement(Content)? Content : null}
    </Screen>
}


PrivacyPolicy.screenName = PRIVACY_POLICY;

PrivacyPolicy.authRequired = false;

PrivacyPolicy.Modal = true;

PrivacyPolicy.title = title;

PrivacyPolicy.Link = Link;