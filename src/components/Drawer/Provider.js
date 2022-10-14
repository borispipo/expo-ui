import React from "$react";
export const DrawerContext = React.createContext(null);

export const useDrawer = ()=>{
    return React.useContext(DrawerContext) || {};
}