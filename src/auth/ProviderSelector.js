// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import Button from "$ecomponents/Button";
import Menu from "$ecomponents/Menu";
import theme from "$theme";
import React from "$react";
import {isObj,defaultStr,defaultObj} from "$cutils";
import PropTypes from "prop-types";
import View from "$ecomponents/View";

/****le selecteur de provider, pour l'authentification */
const ProviderSelector = React.forwardRef(({providers,anchorProps,containerProps,anchor,activeProvider,testID,onChange,...props},ref)=>{
    activeProvider = defaultObj(activeProvider);
    containerProps = defaultObj(containerProps);
    anchorProps = defaultObj(anchorProps);
    testID = defaultStr(testID,"RN_AuthProviderSelectorComponent");
    const menuItems = [];
    Object.map(providers,(provider)=>{
        if(!isObj(provider) || !provider.id) return;
        provider.icon = activeProvider.id == provider.id ? "check":null;
        provider.onPress = ()=>{
            if(activeProvider.id === provider.id) return;
            activeProvider = provider;
            if(typeof onChange =='function'){
                onChange(provider);
            }
        }
        menuItems.push(provider);
    });
    const desc = activeProvider.desc || "";
    const btnLabel = "Se connecter avec "+(activeProvider.id ? ( "["+activeProvider.label+"]") : "");
    return <View testID={testID+"_Container"} {...containerProps} style={[{maxWidth:'100%'},containerProps.style]}>
            <Menu
                ref = {ref}
                sameWidth
                {...props}
                style = {[{maxWidth:'90%'},props.style]}
                items = {menuItems}
                testID = {testID}
                anchor = {typeof anchor =='function'? (p)=>{
                    return anchor({...p,activeProvider});
                } : (p)=>{
                    return <Button upperCase={false} testID={testID+"_Anchor"} 
                        secondary
                        mode={"contained"} 
                        borderRadius={10} 
                        {...p}
                        {...anchorProps}
                        style = {[p.style,theme.styles.mv1,theme.styles.p05,anchorProps.style]}
                        contentStyle={[
                            p.contentStyle,{overflow: 'hidden',textOverflow: 'ellipsis'},
                            anchorProps.contentStyle
                        ]} 
                        title = {btnLabel+(desc?(", "+desc):"")}
                        labelProps = {{splitText:true}}
                        
                    >
                        {btnLabel}
                    </Button>
                }}
            />
    </View>
})

ProviderSelector.displayName = "ProviderSelector";
ProviderSelector.propTypes = {
    activeProvider : PropTypes.object,
    providers : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object)
    ])
}

export default ProviderSelector;