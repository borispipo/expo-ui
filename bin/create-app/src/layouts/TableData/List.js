import SWRDatagrid from "$ecomponents/Datagrid/SWRDatagrid";
import getTable from "$database/tables/getTable";
import { defaultStr } from "$cutils";
import {forwardRef} from "$react";
import fetch from "$capi/fetch";

const TableDataListLayoutComponent = forwardRef(
  ({ tableName, table,fetcher, ...rest }, ref) => {
    tableName = defaultStr(tableName, table).trim().toUpperCase();
    const tableObj = Object.assign({}, getTable(tableName));
    return ( //le SWRDatagrid est le composant datagrid réicrit à l'aide de la librairie swr : (https://swr.vercel.app/) utile pour effectuer le fetching des données distantes
      <SWRDatagrid
        fetchPath = {tableName} //le chemin (path) à passer à la fonction useSWR, @voir : https://swr.vercel.app/
        fetchPathKey={tableName} //IL s'agit d'une chaine de caractère identifiant de manière unique le chemin fetchPath. Si vous faites appels plusieurs fois à ce composants, rassurez vous à chaque fois que cette clié soit distinct pour chaque appel car sionon les données récupérées depuis la BD seront identiques pour tous les appels du composant
        sessionName={tableName} //le nom de la session, utile pour persister les paramètres liés au datagrid de la table data
        filterable={true} //si la table de données est filterable, spécifiez la valeur false, pour que les données ne soit pas filtrable
        canFetchOnlyVisibleColumns={false} //si uniquement les colonnes visisible seront récupérérs depuis la base de données, via le champ fields des options envoyés à la fonction fetcher
        parseMangoQueries = {true} //Spécifiez la valeur false, si vous utilisez une base de données qui accepte les requêtes mangoes (Voir https://www.mongodb.com/docs/manual/tutorial/query-documents) et true pour un backend lié à une BD relationnelle
        {...defaultObj(tableObj.datagrid)} //les props du datagrid lié à la table data
        exportToExcelIsAllowed={"{0}:exporttoexcel".sprintf(tableName)} //la permission pour l'export des données de la table data au format Excel, vous pouvez définir également une fonction de la forme : ()=><boolean>
        exportToPDFIsAllowed={"{0}:exporttopdf".sprintf(tableName)} //la permission pour l'export des données au format pdf, vous pouvez également définir une fonction de la forme : ()=><boolean>
        {...rest}
        ref={ref}
        fetcher={(url, opts) => {
          if(typeof fetcher ==="function"){
            return fetcher(url,opts);
          }
          if(typeof tableObj?.datagrid?.fetcher ==="function"){
            return tableObj?.datagrid.fetcher(url,opts);
          }
          delete opts.fields;
          delete opts?.fetchOptions?.fields;
          console.log(opts.fetchOptions," les options à utiliser pour effectuer le fetch distant des données");
          console.log(url," l'url de la requête")
          console.log(opts.fetchOptions?.where," les options de filtres ")
          //implémenter votre logique de récupération des données distance
          return fetch(url, opts);
        }}
        table={tableObj}
      />
    );
  }
);

export default TableDataListLayoutComponent;

TableDataListLayoutComponent.displayName = "TableDataListLayoutComponent";

TableDataListLayoutComponent.propTypes = {};
