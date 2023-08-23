if(isFilter){
    console.log(forceRender,"is force render heeeeein manaa",rest.style);
    return colsNames.map((columnField,index)=>{
        const visible = columnsVisibilities[index];
        if(!visible) return null;
        return <CellWrapper isFilter key={columnField} columnField={columnField} columIndex={index}/>
    })
}