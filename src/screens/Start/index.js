import {START} from "./routes";
import Content from "./content"
import {getName} from "$app";
import {GROUP_NAMES} from "../utils"
export default function Start(props){
    return <Content 
        {...props}
    />
}

Start.screenName = START;

Start.Modal = true;

Start.groupName = GROUP_NAMES.INSTALL;

export const routeName = START;

Start.options = {
    title:getName(),
    headerShown : false,
    allowDrawer : false,
}

