// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/****Le composant TableLink est utilisé pour les liens cliquable vers les tables de données */
import {TouchableOpacity,StyleSheet} from "react-native";
import React from "$react";
import View from "$components/View";
import PropTypes from "prop-types";
import Label from "$components/Label";
import {defaultStr,isPromise,defaultObj} from "$utils";
import {open as openPreloader,close as closePreloader} from "$preloader";
import {styles as _styles} from "$theme";
import Tooltip from "$components/Tooltip";

const TableLinKComponent = React.forwardRef((props,ref)=>{
    let {disabled,labelProps,server,containerProps,testID,Component,routeName,routeParams,component,_id,primary,triggerProps,onPress,children, ...rest} = props;
    testID = defaultStr(testID,"RN_TableDataLinkContainer")
    rest = defaultObj(rest);
    containerProps = defaultObj(containerProps)
    labelProps = defaultObj(labelProps);
    _id = defaultStr(_id);
    if(!_id){
        disabled = true;
    }
    const pointerEvents = disabled || !_id? 'none' : 'auto';
    const onPressLink = (event)=>{
        React.stopEventPropagation(event);
        const r = typeof onPress =='function'? onPress(event) : undefined;
        if(isPromise(r)){
            openPreloader("traitement de la requête...");
            r.finally(closePreloader);
        }
    }
    rest.style = [rest.style,_styles.cursorPointer];
    const CP = disabled ? View : TouchableOpacity;
    return <CP testID={testID} onLongPres={(e)=>React.stopEventPropagation(e)} {...containerProps} onPress={disabled? undefined : onPressLink} style={[styles.container,containerProps.style]}>
        <Tooltip testID={testID+"_Tooltip"} {...rest} Component={Component}  onPress={disabled?undefined:onPressLink} ref={ref} pointerEvents={pointerEvents} disabled = {disabled}>
            <Label testID={testID+"_Label"} underlined primary {...labelProps} style={[_styles.lh15,labelProps.style]} disabled={disabled}>{children}</Label>
        </Tooltip>
    </CP>
});

export default TableLinKComponent;


TableLinKComponent.propTypes = {
    server : PropTypes.string,//le serveur sur lequel rechercher les données
    primary : PropTypes.bool,//si le composant sera stylé en theme primary de react
    ///les props à utiliser pour afficher la table de données en cas de click sur le lien
    triggerProps : PropTypes.object,
    /*** l'id de la données à récupérer en cas de clic sur le lien */
    _id : PropTypes.string.isRequired,
    routeName : PropTypes.string,///la route via laquelle on devra naviguer
    routeParam : PropTypes.object,///les props à passer à la route en question
    children : PropTypes.node
}

const styles = StyleSheet.create({
    container : {
        alignSelf : 'flex-start',
        flexGrow : 0,
        paddingRight : 5,
        paddingVertical : 5,
    }
})

TableLinKComponent.displayName = "TableLinKComponent";