import { useDatagrid as ud } from "../hooks";
export const useDatagrid = ()=>{
    const {context} = ud();
    const visible = context && typeof context?.canShowFilters =='function' && context.canShowFilters()|| false;
    const isLoading = context && context.isLoading() || false;
    const r = typeof context?.getPreparedColumns =='function'? context?.getPreparedColumns() : {};
    return {...r,visible,isLoading,context};
}