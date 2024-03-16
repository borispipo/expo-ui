import Screen from "$eScreen";
import {List} from "$layouts/TableData";

export default function TableDataListScreen (props){
    return <Screen {...props}>
        <List {...props}/>
    </Screen>
}

TableDataListScreen.withFab = false;//if you want to display main FAB layout on this screen toggle this value to true
TableDataListScreen.withNotifications = true; //pour afficher les notifications dans les écrans de type liste