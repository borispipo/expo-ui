import React from "$react";
import APP from "$app";
import Screen from "$layouts/Screen";

export const screenName = "HOME";


export default function Home (props){
    React.useEffect(()=>{
    },[])
    console.log("will rende rhommd ",props);
    return <Screen {...props} 
        testID = {"RN_MainScreenHome"}
    >
    </Screen>
}

Home.screenName = screenName;

//Home.elevation = 0;

//Home.headerShown = false;

Home.options = {
    title : APP.getName()
}