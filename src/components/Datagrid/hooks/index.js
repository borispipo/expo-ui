import { useContext,useEffect,useMemo,useReducer } from "react";
import { DatagridContext } from "./context";
import {isObj,isNonNullString} from "$cutils";
import events from "../events";
export const useDatagrid = x=> {
    const t = useContext(DatagridContext)
    if(!t || !t?.context || !t?.context?.state || !t?.context?.state?.data){
        throw "Le composant Datagrid actions doit être enfant d'un contexe de datagrid valide";
    }
    return t;
};
export const useDatagridContext = ()=>{
    return useDatagrid()?.context;
}
export const useData = ()=>{
    const {context} = useDatagrid();
    return Array.isArray(context.state.data) && context.state.data || [];
}
export const useSelectedRows = ()=>{
    const {context} = useDatagrid();
}
export const useGetRowKey = ({rowData,rowIndex})=>{
    const {context} = useDatagrid();
    return context.getRowKey(rowData,rowIndex);
};
/****
    @param {string|Array} event, l'évènement ou les évènements en question, qui est trigger par le contexte de datagrid
    @param {function|string} getter, la fonction getter, est la fonction qui prenant en paramètre le contexte, retourne la valeur liée à l'évènement event
    @param {function} onEvent, la fonction appelée lorsque l'évènement est exécutée
*/
export const useOnEvent = (event,getter,onEvent)=>{
    const {context} = useDatagrid();
    if((!isNonNullString(event) && !Array.isArray(event)) || !event.length){
        throw `méthode invalide ${method} supportée par le contexte`;
    }
    if(typeof getter !=='function') {
        throw "méthode getter invalide pour la récupéreration de l'état lié au contexte du datagrid";
    }
    const evBack = event;
    event = Array.isArray(event) ? event : isNonNullString(event)? event.trim().split(",") : [];
    const [state, dispatch] = useReducer(function(state2,action){
        if(event.filter(ev=>action.type.toLowerCase() === ev?.toLowerCase().trim()).length){
            return getter(context,action.type);
        }
        return null;
    }, getter(context,evBack));
    const callbacks = useMemo((...args)=>{
        const callbacks = {};
        event.map((ev)=>{
            callbacks[ev] = (...args)=>{
                if(typeof onEvent ==='function' && onEvent(ev,...args) === false) return false;
                return dispatch({type:ev});
            }
        });
        return callbacks;
    },[event.join(",")]);
    useEffect(()=>{
        Object.map(callbacks,(cb,event)=>{
            context.on(event,cb);
        });
        return ()=>{
            Object.map(callbacks,(cb,ev)=>{
                context.off(ev,cb);
            });
        }
    },[]);
    return state;
}


/****
    ecoute l'évènement event sur le contexte de datagrid
    @param {string} event, l'évènement à écouter
    @param {function} onEvent, la fonction appelée lorsque l'évènement est écoutée
*/
export const useBindEvent = (event,onEvent)=>{
    const {context} = useDatagrid();
    if(!isNonNullString(event)){
        throw `impossible d'écouter un évènemet invalide pour le contexte de datagrid`;
    }
    useEffect(()=>{
        context.on(event,onEvent);
        return ()=>{
            context.off(event,onEvent);
        }
    },[]);
    return onEvent;
}
export const useIsRowSelected = (...args)=>{
    return useOnEvent([events.ON_ROW_TOGGLE,'componentDidUpdate',events.ON_ALL_ROWS_TOGGLE],(context)=>{
        return context.isRowSelected(...args);
    });
};

export const useGetSelectedRowsCount = ()=>{
    return useOnEvent([events.ON_ROW_TOGGLE,'componentDidUpdate',events.ON_ALL_ROWS_TOGGLE],(context,...rest)=>{
        return context.getSelectedRowsCount();
    });
}
export const useIsAllRowsSelected = ()=>{
    return useOnEvent([events.ON_ROW_TOGGLE,'componentDidUpdate',events.ON_ALL_ROWS_TOGGLE],(context)=>{
        return context.isAllRowsSelected();
    });
};
