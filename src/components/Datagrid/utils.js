import theme,{LINE_HEIGHT} from "$theme";
import { StyleSheet } from "react-native";
import {get as getSession} from "./Common/session";
import appConfig from "$capp/config";

export const getRenderType = ()=>getSession("render-type");

export const COLUMN_WIDTH = 75;

export const ROW_SELECTED_BACKGROUND_COLOR = "#e2e2e2e0";

export const ROW_EVEN_BACKGROUND_COLOR = undefined;

export const ROW_ODD_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.01)";

export const ROW_ODD_BACKGROUND_DARKEN_COLOR = "rgba(245, 245, 245, 0.01)"

export const PAID_COLOR = '#4caf50';

export const PAID_TEXT_COLOR = "white";

export const ARCHIVED_COLOR = "#ffc107";

export const APPROVED_COLOR = '#ce04a3';

export const IMPUTED_COLOR = "#943542";

export const IMPUTED_TEXT_COLOR = "white";

export const ROW_BORDER_COLOR = "#ced4da";

export const ROW_BORDER_WIDTH = 1;

export const SELECTABLE_COLUMN_WIDTH = 30;

const MARGIN_VERTICAL = 10, MARGIN_HORIZONTAL = 1;

export const getPaidBackgroundStyle = (rowData)=>{
    let paid = 0;
    if(isObj(rowData)){
        if(typeof rowData.paid =='number' || typeof rowData.paid =='boolean'){
            paid = rowData.paid
        } else {
            if(isObj(rowData.rowData)){
                paid = rowData.rowData.paid;
            } else if(isObj(rowData.row)){
                paid = rowData.row.paid;
            } else if(isObj(rowData.data)){
                paid = rowData.data.paid;
            }
        }
    }
    if(paid){
        return styles.paidBackground;
    }
    return null;
}

export const getImputedBackgroundStyle = (rowData)=>{
    let paid = 0;
    if(isObj(rowData)){
        rowData = defaultObj(rowData.rowData,rowData.row,rowData.data);
    }
    return null;
}


export const ROW_APPROVED_STYLE = {
    //borderRightColor : APPROVED_COLOR,
    //borderRightWidth : 4,
    //marginRight : MARGIN_HORIZONTAL
}

export const ROW_ARCHIVED_STYLE = {
    //borderBottomColor : ARCHIVED_COLOR,
    //borderBottomWidth :4,
    //marginBottom : MARGIN_VERTICAL,
}

export const ROW_PAID_STYLE = {
    //borderLeftColor : PAID_COLOR,
    //borderLeftWidth : 5,
    //marginLeft : MARGIN_HORIZONTAL
}

export const ROW_IMPUTED_STYLE = {
    //borderLeftColor : IMPUTED_COLOR,
    //borderLeftWidth : 5,
    //marginLeft : MARGIN_HORIZONTAL
}

export const ROW_ODD_STYLE = {
    backgroundColor : ROW_ODD_BACKGROUND_COLOR,
}

export const ROW_EVEN_STYLE = {
    backgroundColor : ROW_EVEN_BACKGROUND_COLOR
}

export const ROW_SELECTED_STYLE = {
    backgroundColor : ROW_SELECTED_BACKGROUND_COLOR
}

export const ROW_BORDER_STYLE = {
    marginHorizontal : 0,
    marginVertical : 0,
    borderLeftColor : ROW_BORDER_COLOR,
    borderLeftWidth : 0,
    borderBottomColor : ROW_BORDER_COLOR,
    borderBottomWidth : ROW_BORDER_WIDTH,
    borderRightColor : ROW_BORDER_COLOR,
    borderRightWidth : 0,
    borderTopColor : ROW_BORDER_COLOR,
    borderTopWidth : 0
}


export const DATE_COLUMN_WIDTH = 200;

export {LINE_HEIGHT}

export const styles = StyleSheet.create({
    approved : ROW_APPROVED_STYLE,
    archived : ROW_ARCHIVED_STYLE,
    selected : ROW_SELECTED_STYLE,
    paid : ROW_PAID_STYLE,
    imputed : ROW_IMPUTED_STYLE,
    paidBackground : {
        backgroundColor : PAID_COLOR,
        color : PAID_TEXT_COLOR,
        padding : 5,
    },
    imputedBackground : {
        backgroundColor : IMPUTED_COLOR,
        color : IMPUTED_TEXT_COLOR,
        padding : 5,
    },
    border : ROW_BORDER_STYLE,
    even : ROW_EVEN_STYLE,
    odd : ROW_ODD_STYLE,
    oddDark : {
        ...ROW_ODD_STYLE,
        backgroundColor : ROW_ODD_BACKGROUND_DARKEN_COLOR,
    },
    lineHeight : {lineHeight:LINE_HEIGHT},
    noHorizontalBorder: {
        marginLeft : 0,
        borderLeftWidth : 0,
    },
})


/**
 * 
 * @param {*} props 
 * @returns 
 */
export const getRowStyle = ({row,bordered,numColumns,rowData,isAccordion,isTable,index,paid,archived,approved,rowIndex,selected})=>{
    rowIndex = typeof rowIndex =='number'? rowIndex : typeof index =='number'? index : undefined;
    numColumns = typeof numColumns =="number"? numColumns : 0;
    row = typeof row =='object'? row && row : typeof rowData =='object' && rowData ? rowData : {};
    const borderWidth = numColumns > 1? 1 : 0;
    const style = [bordered !== false ? [styles.border,{borderLeftWidth:borderWidth,borderTopWidth:borderWidth,borderRightWidth:borderWidth}]: undefined,theme.styles.p05,theme.styles.mv05];
    if(rowIndex ===0){
        style.push({borderTopWidth:ROW_BORDER_WIDTH})
    }
    if(rowIndex !== undefined){
        style.push(rowIndex%2===0?styles.even : theme.isDark()?styles.oddDark : styles.odd)
    }
    if(false && selected){
        style.push(styles.selected,{borderBottomWidth:1,borderBottomColor:theme.colors.primary})
    }
    if(paid || row.paid){
        style.push(styles.paid);
    }
    if(approved || row.approved){
        style.push(styles.approved)
    }
    if(archived || row.archived){
        style.push(styles.archived);
    }
    if(!isAccordion){
        style.push(styles.noHorizontalBorder);
    }
    return style;
}

export const willConvertFiltersToSQL = x=>!!appConfig.get("convertDatagridFiltersToSQL");