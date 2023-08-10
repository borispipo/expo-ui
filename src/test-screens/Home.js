import Screen from "$eScreen";
import Test from "$ecomponents/Datagrid/Test";

export default function HomeScreen(props){
    return <Screen{...props}>
        <Test/>
    </Screen>
};

HomeScreen.screenName = "Home";
HomeScreen.authRequired = false;