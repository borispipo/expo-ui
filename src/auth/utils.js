import {isAllowedFromStr} from "$cauth/perms";
/***
 * vérifie si pour la permission perm, l'utilisateur connecté à accès à la resource
 */
export const isPermAllowed = (perm,...permsArgs)=>{
    if(typeof perm === 'boolean') return perm;
    if(typeof perm ==='function' && perm(...permsArgs) === false) return false;
    if(isNonNullString(perm) && !isAllowedFromStr(perm,...permsArgs)) return false;
    return true;
}