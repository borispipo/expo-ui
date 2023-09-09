export default function RealNotEnabledProvider({children}){
    return children;
}

export const useExpoUIRealm = ()=>{
    throw "La base de données realm n'est pas autorisée, veuillez l'autorisez dans les options de votre fichier babel.config.alias, options withRealm à true";
}