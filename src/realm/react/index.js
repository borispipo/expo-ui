import {createRealmContext} from '@realm/react';
export * from '@realm/react';

/*** permet de créer un contexte associé à l'objet Ream */
export const createContext = (realmConfig)=>{
    return createRealmContext(realmConfig);
}

export * from "$erealmProvider";