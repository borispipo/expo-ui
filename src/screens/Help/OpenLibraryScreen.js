import View from "$ecomponents/View";
import Screen from "$escreen";
import {defaultStr,defaultObj,isValidUrl,isObj,isNonNullString} from "$cutils";
import Label from "$ecomponents/Label";
import theme from "$theme";
import Link from "$ecomponents/Link";
import {StyleSheet} from "react-native";
import appConfig from "$capp/config";
import Table from "$ecomponents/Table";
import React  from "$react";
import AutoLink from "$ecomponents/AutoLink";
import {Vertical} from "$ecomponents/AutoSizer";
const packageJSON = require("$packageJSON");

const openLibraries = require("./openLibraries");
const euPackageName = "@fto-consult/expo-ui";

const columns = {
    index : {
        text : "#",
        width : 40,
    },
    library : {
        text : "Librairie/Outil",
        width : 180,
    },
    version : {
        text : "Version",
        width : 60,
    },
    license : {
        text : "Licence",
        width : 80,
    }
}
export default function OpenLibrariesScreen({testID,...props}){
    testID = defaultStr(testID,"RN_HealScreenOpenLibraries");
    if(isObj(packageJSON?.dependencies)){
        const devExpo = packageJSON?.dependencies[euPackageName];
        const opo = isNonNullString(devExpo) ? {version:devExpo.trim().ltrim("^")} : Object.assign({},devExpo);
        openLibraries[euPackageName] = Object.assign({},openLibraries[euPackageName]);
        openLibraries[euPackageName] = {...openLibraries[euPackageName],...opo};
    }
    const data = React.useMemo(()=>{
        const data = [];
        Object.map(openLibraries,(lib,i,_i)=>{
            const da = {
                ...lib,
                index : _i,
                library : i,
            };
            da.url = isValidUrl(da.url)? da.url : da.homepage;
            data.push(da)
        })
        return data;
    },[])
    return <Screen {...props} title={title} containerProps={{style:[theme.styles.justifyContentCenter]}}>
        <View testID={testID+"_OpenLibraries_Header"} style={[theme.styles.row,theme.styles.flexWrap,theme.styles.p1]}>
            <Label testID={testID+"_OpenLibraries_HeaderLabel"} primary textBold>{appConfig.name+"   "}</Label>
            <Label>est bâti sur un ensemble d'outils et librairies open Source</Label>
        </View>
        <Vertical testID={testID+"_OpenLibrariesContent"} style={[theme.styles.w100,theme.styles.pv1]}>
            <Table
                sortable = {false}
                columns = {columns}
                data = {data}
                containerProps = {{style:styles.table}}
                renderCell = {({rowData,columnDef,columnField,...rest})=>{
                    const value = rowData[columnField];
                    switch(columnField){
                        case "index":
                            return <Label>
                                {value.formatNumber()}
                            </Label>
                        case "library" : 
                            return <AutoLink url={rowData.url}>
                                <Label splitText style={styles.textDecorationUnderline} >{value}</Label>
                            </AutoLink>
                        case "version" : 
                            return  <Label splitText numberOfLines={2}>{defaultStr(value)}</Label>
                        case "licence" : 
                            return <AutoLink url={rowData.licenseUrl}>
                                <Label style={styles.textDecorationUnderline} splitText>{rowData.license}</Label>
                            </AutoLink>
                    }
                    return null;
                }}
            />
        </Vertical>
    </Screen>
}

export const title = "A propos des librairies tiers";

OpenLibrariesScreen.title = title;
OpenLibrariesScreen.screenName = "Help/OpenLibraries";
OpenLibrariesScreen.Modal = true;
OpenLibrariesScreen.authRequired = false;

export function OpenLibrariesLink(props){
    const {style,...rest} = props;
    return <Link routeName={OpenLibrariesScreen.screenName}>
        <Label {...defaultObj(rest)} style={[{color:theme.colors.primary},styles.content,style]}>
            {props.children || title}
        </Label>
    </Link>
}

const gridPadding = 5;

const styles = StyleSheet.create({
    container : {
        paddingHorizontal : 10,
        paddingVertical : 10,
    },
    textDecorationUnderline : {
        textDecorationLine:'underline',
    },
     content : {
        textDecorationLine:'underline',
        fontWeight : 'bold',
     },
     grid0: {width:40,padding:gridPadding},
     grid1 : {width:'60%',padding:gridPadding},
     grid2 : {width:60,padding:gridPadding},
     grid3 : {width:60,padding:gridPadding},
     table : {
        width : "100%"
     },
})

OpenLibrariesScreen.Link = OpenLibrariesLink;

export {OpenLibrariesLink as Link};