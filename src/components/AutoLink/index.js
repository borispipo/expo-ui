// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as Linking from 'expo-linking';
import { Pressable,StyleSheet } from 'react-native';
import {isValidUrl,isValidEmail,defaultStr,isSms} from "$cutils";
import PropTypes from "prop-types";
import Browser from "$ecomponents/Browser";

export default function AutolinkComponent({onPress,withBrowser,mailto,email,tel,phone,sms,url,href,...props}){
    url = defaultStr(url,href);
    phone = defaultStr(phone,tel).trim(); 
    const isPhone = phone ? true : false;
    const isUrl = url && isValidUrl(url);
    email = defaultStr(email,mailto);
    const isEmail = email && isValidEmail(email);
    const hasContent = isUrl || isEmail || isPhone;
    return <Pressable 
        testID={"RN_AutoLinkComponent"}
        {...props}
        style = {[hasContent && styles.textDecorationUnderline,props.style]}
        onPress = {(e)=>{
            if(onPress && onPress(e) === false) return;
            if(isUrl){
                if(withBrowser !== false){
                    return Browser.openURL(url);
                }
                return Linking.openURL(url);
            }
            if(isEmail){
                return Linking.openURL('mailto:'+email);
            }
            if(isPhone){
                Linking.openURL((sms?"sms:":"tel:")+phone);
            }
        }}
    />
}

AutolinkComponent.isValid = (url)=>{
    return isValidEmail(url) || isValidUrl(url);
}

const styles = StyleSheet.create({
    textDecorationUnderline : {
        textDecorationLine:'underline',
    },
})
AutolinkComponent.propTypes = {
    onPress : PropTypes.func,
    phone : PropTypes.string,//le numéro à utiliser
    tel : PropTypes.string,
    sms :PropTypes.bool, //si l'application sms sera ouverte au numéro passé en paramètre
    email : PropTypes.string, //si l'on doit envoyer un mail à l'adresse sur laquelle on a cliqué
    mailto : PropTypes.string, ///alias à email
    url : PropTypes.string,
    href : PropTypes.string, ///si ca ouvrira une url
    withBrowser : PropTypes.bool,///si l'on ouvrira l'url avec le navigateur
}