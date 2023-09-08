import React from "$react";
import Dropdown from "$ecomponents/Dropdown";
import {defaultObj,defaultVal,isNonNullString} from "$cutils";
import PropTypes from "prop-types";
import {getLoadedIconsSets} from "./Font";
import {View} from "react-native";
import Icon from "./Icon";
import Label from "$ecomponents/Label";
import theme from "$theme";
import {copyTextToClipboard} from "$clipboard/utils";
import { StyleSheet } from "react-native"; 

const SelectFontIconComponent = React.forwardRef((props,ref)=>{
    const items = React.useMemo(()=>{
        const sets = getLoadedIconsSets();
        const items = [];
        Object.map(sets,({prefix,iconSetName,icons})=>{
            prefix = typeof prefix =='string'? prefix.trim() : "";
            if(prefix){
                prefix = prefix.rtrim("-")+"-"
            }
            icons.map((icon)=>{
                if(!isNonNullString(icon)) return;
                icon = icon.trim();
                items.push({
                    realIcon : icon,
                    iconSetName,
                    icon : `${prefix}${icon.trim().ltrim("-")}`,
                })
            });
        })
        return items;
    },[])
    return <Dropdown
        dialogProps = {{title:'Sélectionner une icone'}}
        {...props}
        type = {'select'}
        items ={items}
        getItemValue ={({item})=>item.icon}
        renderText = {({item})=>item.icon}
        renderItem = {({item})=>{
            const {icon,iconSetName} = item;
            return <View testID="RN_SELECTFontIconContainer" style={[theme.styles.row,styles.content,theme.styles.justifyContentSpaceBetween,theme.styles.alignItemsCenter]}>
                <View style={[theme.styles.row,theme.styles.justifyContentFlexStart,theme.styles.alignItemsCenter]}>
                    <Icon size={35} primary name={icon}/>
                    <View>
                        <Label textBold>{icon}</Label>
                        <Label>{iconSetName}</Label>
                    </View>
                </View>
                <Icon size={25} name="content-copy" title={`Copier la valeur [${icon}] dans le presse papier`} onPress={(e)=>{
                    copyTextToClipboard(icon);
                }}/>
            </View>
        }}
    />
})

SelectFontIconComponent.displayName ="SelectFontIconComponent";

export default SelectFontIconComponent;

SelectFontIconComponent.propTypes = {
    ...Dropdown.propTypes,
    imageProps : PropTypes.object, ///les props à appliquer aux images affichées
}

const styles = StyleSheet.create({
    content : {
        flexGrow : 1,
    }
})


