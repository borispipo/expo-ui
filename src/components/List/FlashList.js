import React from "$react";
import { FlashList } from "@shopify/flash-list";
//import FlashList from "react-native-big-list";
import CommonListComponent from "./Common";
import View from "$ecomponents/View";

const FlashListComponent = React.forwardRef((props,ref)=>{
    const {testID} = props
    return (<CommonListComponent
        testID = {'RN_FlashListComponent'}
        estimatedItemSize = {50}
        ListHeaderComponent={() => (
            <View testID={(testID||'RN_FlashListComponent')+"_Header"}>{props.children}</View>
        )}
        //disableAutoLayout
        //disableHorizontalListHeightMeasurement = {props.horizontal?undefined : true}
        {...props}
        contentContainerStyle = {undefined}
        style = {undefined}
        Component = {FlashList}
        ref={ref}
    />)
})

FlashListComponent.propTypes = {
    ...CommonListComponent.propTypes,
}

export default FlashListComponent;

FlashListComponent.displayName = "FlashListComponent";