import {View,StyleSheet} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from "$react";
/***
    isLoaded {boolean}, est à true lorsque toutes les ressources de l'application ont été chargées, la fonction init de l'application a été appelée et l'application est prête à être rendu à l'utilisateur
        Lorsque isLoaded est false, le Splashscreen est l'écran visible à l'utilisateur
    isInitialized {boolean}, est à true lorsque la fonction init de l'application a été appelée
    isLoading {boolean}, est à false lorsque les resources de l'application, notemment les fonts, polices, les assets sont en train d'être chargées
    hasGetStarted {boolean}, lorsque la fonction init est appelée, si cette fonction retourne une promesse qui est résolue, alors l'application est suposée comme get started sinon alors l'application est suposée comme non get started et l'écran GetStarted est affichée à l'écran
*/
export default function AppEntryRootView({MainProvider,isLoaded,hasGedStarted,isInitialized,isLoading,...props}){
    const hasProvider = React.isComponent(MainProvider);
    const Wrapper = hasProvider? MainProvider : React.Fragment;
    const wrapProps = hasProvider ? {isLoaded,isLoading,isInitialized,hasGedStarted} : {};
    const insets = useSafeAreaInsets();
    return <Wrapper {...wrapProps}>
        <View
            testID="RN_MainAppEntryRootView"
            {...props}
            style = {StyleSheet.flatten([
            {
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
              },
            props.style,{flex:1}])}
        />
    </Wrapper>
}