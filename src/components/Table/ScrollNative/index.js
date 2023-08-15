import React from "$react";
const TableScrollViewNative = React.forwardRef(({children,...props},ref)=>{
    return children;
});
TableScrollViewNative.displayName = "TableScrollViewNative";

export default TableScrollViewNative;