import accordion from "./accordion";
import table from "./table";
import {navigateToTableData} from "$enavigation/utils";
import editIcon from "./editIcon";
import addIcon from "./addIcon";
import newElementLabel from "./newElementLabel";
import { generateData } from "./utils";

export default {
    fetcher : (url,options)=>{ //la fonction fetcher à passer au composant SWRDatagrid
        return Promise.resolve(generateData(1000)); //génère 100 utilisateurs à l'aide de la librarire faker
    },
    accordionProps : {
        accordion,
        bottomSheetTitle : ({rowCounterIndex})=>{
            return "Détail sur l'utilisateur N° "+rowCounterIndex.formatNumber();
        },
    },
    /*** les actions du datagrid lorsqu'on sélectionne les éléments de la table */
    selectedRowsActions : ({selectedRows,selectedRowsCount,...rest})=>{
        return {
            edit : {
                text : 'Modifier/Consulter',
                icon : editIcon,
                perm : `${table}:update|read`, //cette action n'est affiché si et seulement si l'utilisateur a la permission de modifier la table 
                onPress : ({selectedRows})=>{
                    navigateToTableData(table,{datas:selectedRows});
                }
            },
        }
    },
    actions : [
        {
            text : newElementLabel,
            icon : addIcon,
            perm : `${table}:create`, //cette action n'est affichée si et seulement si l'utilisateur a la permission de créer un élément lié à la table data
            onPress : ()=>{
                navigateToTableData(table,{});
            }
        }
    ],
}