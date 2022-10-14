
import {SIGN_IN} from "./routes"
import Screen from "$screen";
import {GROUP_NAMES} from "$screens/utils";
import Login from "$auth/components/Login";
import {getScreenProps} from "$navigation/utils";
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
AuthSignInScreen.groupName = GROUP_NAMES.PUBLIC;
AuthSignInScreen.modal = true;
AuthSignInScreen.allowDrawer = false;

export default [AuthSignInScreen];