import {createContext,useContext} from "react";

export const TableContext = createContext(null);

const useTable = ()=> useContext(TableContext);

export default useTable;