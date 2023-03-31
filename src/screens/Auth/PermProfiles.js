import FormDataScreen from "$elayouts/Screen/FormData";
import {defaultStr,defaultObj} from "$cutils";
import PermLines from "./PermLines";
import PropTypes from "prop-types";
import Label from "$components/Label";
import theme from "$theme";

export const screenName = "PermProfileScreens";

export default function PermProfilesScreen({onChange,fields,data,profile,perms,user,...props}){
    return <FormDataScreen
        {...props}
        modal
        withScrollView
        header = {<Label primary upperCase textBold style={[theme.styles.p1]}>Permissions liées au profil</Label>}
        fields = {isObj(fields) && Object.size(fields,true) && fields || { code : {
            text : 'Nom du profil',
            type : 'id',
            maxLength:30,
            primaryKey : true,
        }}}
        data = {defaultObj(profile,profile)}
        testID = {"RN_PermProfile_FormData"}
        title = {defaultStr(props.title,"Groupe de profil")}
        children = {<PermLines user={user} perms = {perms} isMasterAdmin={false} 
        onChange={onChange}/>}
    />
}

PermProfilesScreen.screenName = screenName;

PermProfilesScreen.Modal = true;

PermProfilesScreen.propTypes = {
    user : PropTypes.object,//l'objet user
    perms : PropTypes.object,//les permissions associées à l'utilisateur user
    profile : PropTypes.object,//les informations sur le profil en cour de modification
}