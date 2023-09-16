import AppEntry from "./src";

export default function MainExpoApp(props){
    return <AppEntry
        navigation={{
            screens : require("./src/test-screens").default
        }}
        init ={({appConfig})=>{
            appConfig.set("isAuthSingleUserAllowed",true);
            appConfig.set("authDefaultUser",{code:"root",password:"admin123",label:"Master admin"})
            return Promise.resolve("test ted")
        }}
        {...props}
    />
}