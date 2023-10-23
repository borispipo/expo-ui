import styles from "../styles";
import Header from "../Header/index";
import theme from "$theme";
import {useTable} from "../hooks";
import React from "$react";
import {classNames} from "$cutils";
import Thead from "./Thead";

const TableHeadersWrapperComponent = React.forwardRef(({className},ref)=>{
    const {testID,tableHeadId} = useTable();
    const filters = React.useMemo(()=><Header isFilter={true} testID={testID+"_TableFilters"} style={[styles.header,styles.filters,theme.styles.pt0,theme.styles.pb0,theme.styles.ml0,theme.styles.mr0]}/>,[])
    return <Thead ref={ref} id={tableHeadId} className={classNames(className,"virtuoso-list-render-table-thead")} style = {{zIndex:100, position: 'sticky', top: 0 ,width:"100%"}}>
        <Header isHeader={true} testID={testID+"_TableHeader"}/>
        {filters}   
        <Header isFooter testID={testID+"_TableFooter"}  style={[styles.header,styles.footers,theme.styles.pt0,theme.styles.pb0,theme.styles.ml0,theme.styles.mr0]}/>
    </Thead>
});

export default TableHeadersWrapperComponent;


