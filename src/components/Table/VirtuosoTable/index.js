import { StyleSheet } from "react-native"
import {classNames} from "$cutils";
export default function VirtuosoTableComponent({style,className,...props}){
    return <table{...props} className={classNames(className,"virtuoso-table-component")} style={StyleSheet.flatten([{ borderCollapse: 'separate',width:"100%" },style])} />
}