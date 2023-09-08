import { StyleSheet,Platform } from "react-native";
import {isMobileNative} from "$cplatform";

const styles = StyleSheet.create({
    datagrid : {
        flex:1,
    },
    contentContainer : {
        flex:1,
    },
    headerCellLabel : {maxHeight:70},
    tdSectionHeader : {
        width : "100%",
    },
    container : {
        width : '100%',
        minHeight : 300,
        paddingBottom : 10,
        paddingLeft : 0,
        paddingRight : 0,
        flex : 1,
        position : 'relative',
    },
    header2footerContainer:{
        flexDirection : 'column',
        width : '100%',
        height : '100%',
        minHeight : 50,
    },
    headerContainer : {
        width : '100%',
        flexDirection : 'row',
    },
    header: {
        flexDirection: 'row',
        paddingVertical : 7,
        alignItems : 'center',
        width : '100%',
        minHeight : 40,
    },
    filters : {
       maxHeight : 50,
    },
    footers : {
        minHeight : 40,
    },
    footerContainer : {
        width : '100%',
        flexDirection : 'row',
        flexWrap : 'wrap',
    },
    headerItemOrCell : {
        alignItems: 'flex-start',
        alignSelf : 'center',
        height : '100%',
        justifyContent: 'center',
        textAlign : 'left',
        flexWrap : 'wrap',
        paddingHorizontal:5,
        paddingVertical : 0,
    },
    filterCell : {
        alignSelf : "flex-start",
        textAlign : "left",
        paddingHorizontal : 2,
        paddingVertical : 0,
        marginVertical : 0,
        marginHorizontal : 0,
        maxHeight : 40,
        justifyContent : 'flex-start',
    },
    filter : {
        minHeight : 30,
    },
    headerItem: {
        minHeight: 30,
    },
    column : {
        flexDirection : 'row',
        justifyContent : 'center',
        alignItems : 'flex-start',
    },
    tr : {
        position : "relative",
    },
    row : {
        flexDirection : "row",
        justifyContent : "flex-start",
        alignItems : 'center',
        width : '100%',
    },
    rowNoPadding : {
        paddingHorizontal:0,
        marginHorizontal : 0,
        marginVertical : 0,
    },
    hasNotData : {
        flexDirection : 'column',
        width : '100%',
        justifyContent : 'center',
        alignItems : 'center'
    },
    cell : isMobileNative()? {
        paddingLeft:10,
        paddingRight : 10,
        paddingBottom : 2,
        paddingTop : 2,
    } : {
        paddingLeft: 10,
        paddingTop:7,
        paddingBottom:7,
        paddingRight: 10
    },
    sectionListHeader : {
        paddingVertical : 10,
        paddingHorizontal : 10,
    },
    sectionListHeaderAbsolute : {
        position : "relative",
        top : "0",
        left : "0",
        width : "100%",
        paddingLeft : 0,
        paddingRight : 0,
        textAlign : "center",
        whiteSpace : "nowrap",
    },
    accordionSectionListHeader : {
        paddingLeft : 0,
        paddingRight : 0,
    },
});
export default styles;