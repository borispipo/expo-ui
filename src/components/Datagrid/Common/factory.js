import Common from "./Common";
import TableDatagrid from "./TableData";

export default function FactoryComponent(Factory) {
    if(typeof Factory ==='string' && Factory.toLowerCase().trim() === 'table'){
        return TableDatagrid;
    }
    return Common;
}