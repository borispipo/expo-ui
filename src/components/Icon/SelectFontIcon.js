import React from "$react";
import Dropdown from "$ecomponents/Dropdown";
import {defaultObj,defaultVal,isNonNullString} from "$cutils";
import PropTypes from "prop-types";
import {getLoadedIconsSets} from "./Font";
import {View} from "react-native";
import Icon from "./Icon";
import Label from "$ecomponents/Label";
import theme from "$theme";

const SelectFontIconComponent = React.forwardRef((props,ref)=>{
    const items = React.useMemo(()=>{
        const sets = getLoadedIconsSets();
        const items = [];
        Object.map(sets,({prefix,icons})=>{
            icons.map((icon)=>{
                if(!isNonNullString(icon)) return;
                if(prefix){
                    items.push(`${prefix.rtrim("-")}-${icon.trim()}`)
                } else {
                    items.push(icon.trim());
                }
            })
        })
        return items;
    },[])
    return <Dropdown
        dialogProps = {{title:'Sélectionner une icone'}}
        {...props}
        type = {'select'}
        items ={items}
        getItemValue ={({item})=>item}
        renderText = {({item})=>item}
        renderItem = {({item})=>{
            return <View testID="RN_SELECTFontIconContainer" style={[theme.styles.row,theme.styles.w100,theme.styles.justifyContentFlexStart,theme.styles.alignItemsCenter]}>
                <Icon size={40} primary name={item}/>
                <Label>{item}</Label>
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




