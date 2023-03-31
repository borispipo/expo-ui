import Divider from "$ecomponents/Divider";
import {defaultObj,defaultFunc,defaultStr,isObjOrArray,defaultVal,isObj} from "$cutils";
import React from "$react";
import {StyleSheet} from "react-native";
import Action from '$ecomponents/Form/Action';
import Expandable from "$ecomponents/Expandable";
import {cursorPointer} from "$theme";
import Item from "./Item";

export const MIN_WIDTH = 180;

export const renderItems = (props)=>{
    let _items = [];
    let {items,renderItem,testID,isBottomSheetItem,onPressItem,filter,closeOnPressItem,openMenu,closeMenu,itemProps} = props;
    itemProps = defaultObj(itemProps);
    testID = defaultStr(testID,"RN_MenuComponents.Items")
    filter = defaultFunc(filter,x=> true);
    Object.map(items,(item,index,_index)=>{
        if(!isObj(item)|| !filter({items,item,_index,index})) return null;
        if(React.isValidElement(item)) {
            _items.push(<React.Fragment key={index+"_"+_index}>{item}</React.Fragment>);
            return
        }
        if(item.divider === true && !item.title && !item.text && !item.label && !item.icon){
            _items.push(<Divider testID={testID+"_Divider"+index} {...item} key={index}/>);
            return
        }
        let {onPress,isFormAction,title,text,label,children,closeOnPress,items:itemItems,...rest} = item;
        let Component = Item;
        rest = defaultObj(rest);
        if(isFormAction){
            rest.Component = Item;
            Component = Action;
            rest.isMenuItem = true;
        }
        let itemsR = isObjOrArray(itemItems)? renderItems({closeOnPress,testID:testID+index+".Items"+index+".Items",...props,closeOnPress:defaultVal(closeOnPress,props.closeOnPress,undefined),onPressItem,renderItem,items:itemItems}) : null;
        if(!Array.isArray(itemsR) || !itemsR.length){
            itemsR = null;
        }
        title = defaultVal(title,text,label,children);
        let _render = null;
        if(itemsR){
             _render = <Expandable testID={testID+index+"_Expandable"} {...itemProps} {...rest} title={title} key={index}>
                {itemsR}
            </Expandable>
        } else {
            const itProps = {
                ...itemProps,
                testID : testID+index,
                ...rest,
                title,
                label : title,
                onPress : (args)=>{
                    if((props.closeOnPress !== false && closeOnPress !== false && closeOnPressItem !== false && closeMenu)) {
                       closeMenu();
                    }
                    const ag = {closeMenu,openMenu,fromMenu:true,item,title,label,...React.getOnPressArgs(args),index,_index};
                    if(onPressItem){
                        onPressItem(ag);
                    }
                    if(onPress){
                        onPress(ag)
                    }
                },
                index,
                _index,
            };
           itProps.labelStyle = StyleSheet.flatten([itemProps.style,rest.style,cursorPointer]);
            
           if(typeof renderItem ==='function'){
               _render = renderItem(itProps);
           } else {
             if(title  || itProps.icon){
                _render = <Component testID={testID+"_"+index} {...itProps} isBottomSheetItem={isBottomSheetItem} title={title} key={index}/>
             }
           }
        }
        if(React.isValidElement(_render)){
            _items.push(_render);
            if(item.divider === true){
                _items.push(<Divider testID={testID+"_DividerItem"+index} {...item} key={index+"divider"}/>);
            }
        }
    });
    return _items;
}
