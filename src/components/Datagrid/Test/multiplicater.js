module.exports = (args,from,to)=>{
    let {rowData,value,columnField,data,field} = args;
    columnField = defaultStr(columnField,field);
    rowData = defaultObj(rowData,data);
    value = defaultDecimal(value,rowData[columnField]);
    return Math.abs(value);
}