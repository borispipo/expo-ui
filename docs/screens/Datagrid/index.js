import Screen from "$eScreen";
import Test from "$ecomponents/Datagrid/Test";
import React  from "$react";

export default function DatagridScreen(props){
    return <Screen{...props} contentContainerStyle={[{flex:1}]}>
        <Test/>
    </Screen>
};

DatagridScreen.screenName = "datagrid/test";
DatagridScreen.authRequired = false;