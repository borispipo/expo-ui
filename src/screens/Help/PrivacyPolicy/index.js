import View from "$components/View";
import {PRIVACY_POLICY} from "./routes";
import title from "./title"
import { GROUP_NAMES } from "../../utils";
import Label from "$components/Label";
import  Screen  from "$screen";

export default function PrivacyPolicy(props){
    return <Screen 
        {...props}
        withDrawer = {false}
        appBarProps  = {{
            backAction : false,
            title,
            actions : [{
                text : "Accepter",
                icon : "check",
                onPress : ({goBack})=>{
                    goBack();
                }
            }]
        }}
    >
        <View>
            <Label>
                Ici les termes and conditioins, PrivacyPolicy
            </Label>
        </View>
    </Screen>
}


PrivacyPolicy.screenName = PRIVACY_POLICY;

PrivacyPolicy.groupName = GROUP_NAMES.PUBLIC;

PrivacyPolicy.Modal = true;