import Screen from "$eScreen";
import {Form as FormLoader} from "$ecomponents/ContentLoader";
import { tableDataLinkRouteName } from "../navigation/utils";
import { useEffect,useState } from "react";
import { usePrepareProps } from "../components/TableLink";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import theme from "$theme";
import Preloader from "$preloader";
import notify from "$notify";

export default function TableDataLinkScreen(p){
    const {navigate,fetchData,isAllowed,...props} = usePrepareProps(p);
    const [content,setContent] = useState(null);
    useEffect(()=>{
        if(!isAllowed()){
            setContent(<NotAllowed />)
            return ()=>{};
        }
        Preloader.open("traitement de la requête....");
        fetchData().then(navigate).catch(notify.error).finally(Preloader.close);
        return ()=>{}
    },[])
    return <Screen
        children = {content||<FormLoader/>}
        {...props}
    />
}

function NotAllowed(){
    return <View style={[theme.styles.flex1,theme.styles.h100,theme.styles.w100,theme.styles.justifyContentCenter,theme.styles.alignItemsCenter]}>
        <Label error textBold fontSize={18}>Vous n'êtes pas autorisé à accéder à la resource demandée!!!Veuillez contacter votre administrateur.</Label>
    </View>
}

TableDataLinkScreen.screenName = tableDataLinkRouteName;