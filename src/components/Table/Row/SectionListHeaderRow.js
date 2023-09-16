import {useTable} from "../hooks";
import React from "$react";
export default function SectionListHeaderRow ({cells:cCells,rowIndex,rowData,headerContent}){
    const {visibleColsNames} = useTable();
    const cells = Array.isArray(cCells)? cCells : [];
    if(!cells.length){
        if(React.isValidElement(headerContent)){
            return <td colSpan={visibleColsNames.length} style={{padding:"10px"}} className="datagrid-table-section-list-header-unique-cell" children={headerContent}/>
        }
        return visibleColsNames.map((c,i)=>{
            return <td key={i} className={"datagrid-table-section-list-header-no-cell"} style={{width:"0",height:0,display:"none",opacity:0}}/>
        })
    }
    return cells;
}