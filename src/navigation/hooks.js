import {createContext,useContext} from "react";

const MainNavigationContext = createContext(null);

export const useMainNavigation = ()=>{
    return useContext(MainNavigationContext);
}

export const MainNavigationProvider = ({children,...props})=>{
    return <MainNavigationContext.Provider value = {props} children={children}/>
}