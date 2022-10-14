import CommonDatagrid from "./Common/Common";
import TableDatagrid from "./Common/TableData"
import {defaultStr} from "$utils";


export default function Factory(type) {
    type = defaultStr(type).toLowerCase();
    if(type.contains('table')){
      TableDatagrid;
    }
    return CommonDatagrid;
}