
import { DatagridContext } from "./context";
import React from "$react";
export default function DatagridComponentProvider({children,context,...props}){
    return <DatagridContext.Provider value={{...props,context}} children={children}/>
}
