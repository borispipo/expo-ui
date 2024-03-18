import SelectTableData from "$ecomponents/Form/Fields/SelectTableData";
import React from "$react";
import fetch from "$capi/fetch";

const SelectTableDataComponentLayout = React.forwardRef(({fetchItems,...props},ref)=>{
    return <SelectTableData
        {...props}
        ref = {ref}
        parseMangoQueries = {true}
        prepareFilters = {false}
        /****
            implémenter votre logique de récupération des données des en base de donées, des champs de type SelectTableData, permettant la sélection d'une table de donénes de la bd
        */
        fetchItems={(path,opts)=>{
            if(typeof fetchItems =='function'){
                return fetchItems(path,opts);
            }
            return fetch(path,opts);
        }}
    />
});

SelectTableDataComponentLayout.propTypes = SelectTableData.propTypes;

SelectTableDataComponentLayout.displayName = "SelectTableDataComponentLayout";

export default SelectTableDataComponentLayout;