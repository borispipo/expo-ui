import Screen from "$eScreen";
import Test from "$ecomponents/Datagrid/Test";
import React  from "$react";

export default function HomeScreen(props){
    React.useEffect(()=>{
    },[])
    return <Screen{...props} contentContainerStyle={[{flex:1}]}>
        <Test/>
    </Screen>
};

HomeScreen.screenName = "Home";
HomeScreen.authRequired = false;