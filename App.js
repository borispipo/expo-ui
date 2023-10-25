import AppEntry from "./src";
import {disableAuth} from "$econtext/hooks";

export default function MainExpoApp(props){
    return <AppEntry
        navigation={{
            screens : require("./docs/screens").default,
            drawerItems:require("./docs/drawerItems").default,
        }}
        init ={({appConfig})=>{
            disableAuth();
            return Promise.resolve("test ted")
        }}
        {...props}
    />
}