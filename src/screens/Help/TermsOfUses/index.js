import {TERMS_OF_USES} from "./routes";
import title from "./title";
import Screen from "$screen";
import Link from "./Link";
import Content from "$TermsOfUses";
import {getScreenProps} from "$cnavigation";
import {extendObj} from "$utils";
import React from "$react";

export default function TermsOfUses(p){
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


TermsOfUses.screenName = TERMS_OF_USES;

TermsOfUses.authRequired = false;

TermsOfUses.Modal = true;

TermsOfUses.Link = Link;

TermsOfUses.title = title;

