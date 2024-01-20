import Introdoction from "../../screens/Introduction";
import Datagrid from "../../screens/Datagrid";
export default [
    {
        text : "Introduction",
        icon : "alpha-i-box",
        drawerSection : "introduction",
        routeName : Introdoction.screenName,
    },
    {
        text : "Datagrid",
        icon : "table",
        drawerSection : "components",
        routeName : Datagrid.screenName,
    }
]