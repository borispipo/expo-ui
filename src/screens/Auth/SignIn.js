
import {SIGN_IN} from "$cauth/routes"
import Screen from "$escreen";
import Login from "$eauth/Login";
import {getScreenProps} from "$cnavigation";
import {getTitle} from "./utils";


function AuthSignInScreen(_props){
    const props = getScreenProps(_props);
    const title = getTitle();
    return <Screen 
        title = {title}
        appBarProps = {{
            title,backAction:false
        }}
        contentContainerStyle = {{justifyContent:'center',alignItems:'center'}}
    >
        <Login
            {...props}
        />
    </Screen>
}

AuthSignInScreen.screenName = SIGN_IN;
AuthSignInScreen.authRequired = false;
AuthSignInScreen.modal = true;
AuthSignInScreen.allowDrawer = false;
export default AuthSignInScreen;