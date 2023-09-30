import { StyleSheet } from "react-native"
import {classNames} from "$cutils";
import React from "$react";
import Headers from "../Headers";
export default function VirtuosoTableComponent({style,className,children,...props}){
    return <table{...props} className={classNames(className,"virtuoso-table-component")} style={StyleSheet.flatten([{position:"relative",borderCollapse: 'separate',width:"100%" },style])}>
        {<Headers className={classNames("virtuoso-table-headers")}/>}
        {children}
    </table>
}