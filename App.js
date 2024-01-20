import AppEntry from "./src";
import {disableAuth} from "$cauth";
import { registerRootComponent } from 'expo';
export default function MainExpoApp(props){
    return <AppEntry
        navigation={{
            screens : require("./docs/screens").default,
            drawerItems:require("./docs/navigation/drawerItems").default,
            drawerSections : require("./docs/navigation/drawerSections")?.default,
        }}
        init ={({appConfig})=>{
            disableAuth();
            return Promise.resolve("test ted")
        }}
        {...props}
    />
}

registerRootComponent(MainExpoApp);