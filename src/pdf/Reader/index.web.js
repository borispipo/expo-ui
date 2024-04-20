import React from "$react";
import DialogProvider from "$ecomponents/Dialog/Provider";

let dialogRef = null;

export default function WebPDFReader(){
    dialogRef = React.useRef(null);
    return <>
        <DialogProvider
            ref = {dialogRef}
            responsive = {false}
        />
    </>
}

export const open = (props)=>{
    if(!dialogRef || !dialogRef?.current) return;
    DialogProvider.open({
        ...props,
    },dialogRef.current);
}