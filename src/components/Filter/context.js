import {createContext,useContext,useRef,useMemo} from "react";

export const FiltersContext = createContext(null);

export const useFilters = x=>useContext(FiltersContext);

export const FiltersProvider = ({})=>{
    const filtersValuesRef = useRef({});
}