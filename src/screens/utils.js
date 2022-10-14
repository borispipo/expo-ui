export {sanitizeName} from "$cnavigation/utils";
/**** les groupes d'écrans stack de l'application
 *  un écran peut appartenir à un seul ou plusieur groupe. cependant, le groupe préviée prend la priorité.
 * Ainsi, un écran ne peut être a la fois être public et privée. si tel est le cas, le groupe privée emporte
 *
 */
export const GROUP_NAMES = {
    PUBLIC : "PUBLIC", //les écrans publiques, ne nécessitant pas que l'utilisateur soit connecté
    PRIVATE : "PRIVATE", //les écrans privés : nécessitant une connexion de l'utilisateur pour être accessible
    INSTALL : "INSTALL", //les écrans d'installation de l'application, accessible uniquement à la première installation,
    START : "INSTALL", //install est un alias à start
    DEFAULT : "PRIVATE",
}
