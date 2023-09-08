import {useTable} from "../hooks";
export default function SectionListHeaderRow ({cells,rowIndex,rowData,headerContent}){
    const {visibleColsNames} = useTable();
    if(!Array.isArray(cells) || !cells.length){
        return visibleColsNames.map((c,i)=>{
            return <td key={i}/>
        })
    }
    return cells;
}