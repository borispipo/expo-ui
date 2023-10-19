import CommonListComponent from "./Common";
import {defaultObj,defaultDecimal} from "$cutils";
import React from "$react";
import {ActivityIndicator} from "react-native-paper";
import BigList from "react-native-big-list";

const ListComponent =  React.forwardRef((props,ref)=>{
    let {getItemLayout,itemHeight,...rest} = props;
    rest = defaultObj(rest);
    if(typeof itemHeight !== 'function'){
        getItemLayout = typeof getItemLayout ==='function'? getItemLayout : 
        typeof itemHeight ==='number' && itemHeight ? ({data, index}) => 
            ({length: itemHeight, offset: rest.itemHeight * index, index}) : undefined
    }
    
    return <CommonListComponent
            placeholder
            placeholderComponent = {ActivityIndicator}
            defaultItemHeight = {50}
            {...rest}
            ref = {ref}
            renderScrollViewWrapper = {(children)=>{
                if(typeof renderScrollViewWrapper =="function"){
                    return renderScrollViewWrapper({children});
                }
                return children;
            }}
            getItemLayout = {getItemLayout}
            itemHeight = {itemHeight}
            Component = {BigList}
            isBigList
        />
})
ListComponent.prototypes = {
    ...defaultObj(BigList.propTypes),
    
}   

export default ListComponent;

ListComponent.propTypes = {
    ...CommonListComponent.propTypes
}

ListComponent.displayName = "BigListComponent";