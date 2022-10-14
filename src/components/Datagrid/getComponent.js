import Table from "./Table";
import Accordion,{ TableDatagrid as TableDataAccordion} from "./Accordion";
import {get} from "./Common/session";
import {defaultStr} from "$utils";
let Virtual = null;
let Datatable = Table;
let FixedTable = null;
export default function getComponent(props){
    props = isObj(props) ? props : {};
    let renderType = defaultStr(get("render-type"),APP.isDesktopMedia()? "fixed":'accordion').trim().toLowerCase()
    let isDesktop = APP.isDesktopMedia();
    if(isDesktop){
        FixedTable = require("./FixedTable");
        Virtual = require("./renderVirtual");
        if(renderType =="fixed"){
            return FixedTable;
        }
        if(renderType == 'virtual'){
            return Virtual;
        } 
    }
    if(renderType == 'accordion' && (isFunction(props.accordion) || props.accordion === true)){
        return Accordion;
    }
    return Table;
}
