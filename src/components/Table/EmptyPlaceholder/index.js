import {useEffect} from "react";
import { StyleSheet } from "react-native";
import View from "$ecomponents/View";
import {defaultStr,defaultNumber,uniqid,classNames} from "$cutils";
import { useWindowDimensions } from "react-native";
import {useTable} from "../hooks";

export default function EmptyPlaceholderComponent({testID,content}){
    testID = defaultStr(testID,"RN_VirtuosoTableEmptyPlaceholder");
    const {id : tableId,visibleColsNames} = useTable();
    const id = `${tableId}-empty-placeholder`;
    const listID = `${tableId}-list`;
    const clx = "virtuoso-table-empty-placehoder";
    const {width:dimW} = useWindowDimensions();
    useEffect(()=>{
        const list = document.querySelector(`#${listID}`),content = document.querySelector(`#${id}-content`);
        if(!list || !content || !list.offsetWidth) return;
        const width = list.offsetWidth || list.clientWidth;
        content.style.width = `${width}px`;
    },[dimW]);
    return <tbody id={`${id}-tbody`} data-test-id={`${testID}-tbody`} className={`${clx}-tbody`} style={wStyle}>
        <tr id={`${id}-tr`} data-test-id={`${testID}-tr`} className={`${clx}-tr`} style={wStyle}>
            <td colSpan={visibleColsNames.length} id={`${id}-td`} width={"100%"} height={"100%"}  data-test-id={`${testID}-td`} style={wStyle}>
                <View testID={testID} id={`${id}-content`} style={styles.content}>{content}</View>
            </td>
        </tr>
    </tbody>
}
const wStyle = {
    width : "100%",
    height : "100%",
    position : "relative"
}
const styles = StyleSheet.create({
    content : {
        alignItems:"center",
        justifyContent : "center",
        height : "100%",
        width : "100%",
    },
})