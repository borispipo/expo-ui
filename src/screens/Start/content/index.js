import Logo from "$ecomponents/Logo";
import PrivacyPolicyLink from "$escreens/Help/PrivacyPolicy/Link"
import TermsOfUseLink from "$escreens/Help/TermsOfUses/Link"
import {StyleSheet} from "react-native";
import View from "$ecomponents/View";
import {Paragraph} from "react-native-paper";
import Label from "$ecomponents/Label";
import theme from "$theme";
import React from "$react";
import Button from "$ecomponents/Button";

export default function StartContent (props) {
    const buttonRef = React.useRef(null);
    const onPressText = x=> {
        let {extra,onGetStarted} = props;
        extra = defaultObj(extra);
        const args = {...props,data:{}};
        /*** en fait dans les paramètres d'initialisation, les extra options ont été passé par la fonction init de $app
         * dans ces paramètres, une options onGetStarted a été définie dans le corps de la fonction init de $app afin que le Start exécute cette fonction une fois 
         * que l'utilisateur aura accepté les terms2Uses et les privacyPolicies
         */
        const hasG = typeof onGetStarted =='function' || typeof extra.onGetStarted =='function'? true : false;
        if(typeof onGetStarted =="function"){
            onGetStarted(args);
        } else if(typeof extra.onGetStarted =='function'){
            extra.onGetStarted(args);
        }
        if(hasG){
            buttonRef.current?.setIsLoading(true);
        }
    }
    return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <View style={{height:Logo.height}}> 
            <Logo/>
        </View>
        <Paragraph style={[styles.container]}>
            En cliquant sur <Label style={[styles.accept]}>Accepter ,
            </Label> vous <Label style={[styles.accept,{color:theme.colors.primaryOnSurface}]}>acceptez</Label> notre
            {" "}<PrivacyPolicyLink /> {" "} ainsi que le{" "} 
            <TermsOfUseLink/>.
        </Paragraph>
        <View style={[styles.buttonWrapper]}>
            <Button ref={buttonRef} mode="contained" style={[styles.accept,{backgroundColor:theme.colors.primary,color:theme.colors.primaryText}]} onPress={onPressText}>
                Accepter
            </Button>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container : {
        flex:0,lineHeight:25,
        padding:30,
        paddingTop:0,
        alignItems:'center',
        justifyContent:'flex-start'
    },
    accept : {
        fontWeight:'bold'
    },
    buttonWrapper : {
        height:75,
        alignItems:"flex-end"
    },
})