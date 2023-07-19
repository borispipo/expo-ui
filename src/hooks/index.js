
import Dimensions from "$cplatform/dimensions";
import useStableMemo  from "$react/useStableMemo";
import { useWindowDimensions } from "$cdimensions";
import {isObj} from "$cutils";
import { StyleSheet } from "react-native";


/*** permet d'attacher un lister sur la modification des props de manière responsive : 
    permet de récupérer la fonction à attacher par défaut au listener DimensionChange, pour la mise à jour automatique de la propriété style
   * @param mediaQueryUpdateStyleCb{function}, la fonction permettant de mettre à jour les props lorsque la taille de l'écran change
   * @param timeout {number}, le délai d'attente à passer à la fonction debounce, pour pouvoir appeler la fonction de mise à jour des props lorsque la taile de l'écran change
 *  @return {object{remove:function}||null} l'objet null ou ayan la fonction remove permettant de suprimer le listerner lorsque le composant est démonté
 */
export const addMediaQueryUpdateStyeSubscription = (mediaQueryUpdateStyleCb,timeout)=>{
    if(typeof mediaQueryUpdateStyleCb !='function') return null;
    const options = isObj(timeout)? timeout : {};
    timeout = typeof timeout =='number'? timeout : typeof options.timeout =='number'? options.timeout : 200;
    return Dimensions.addEventListener("change",debounce((dimensions)=>{
        return mediaQueryUpdateStyleCb(Dimensions.getDimensionsProps(dimensions));
    },timeout));
}

/*** met à jour dynamiquemnet les propriétés style d'un objet en fonction du changement de la taille de l'objet
 * @param {useCurrentMedia} {boolean} si true, alors les propriétés sont mis à jour uniquement si le current media change
   @param {mediaQueryUpdateStyle}, la fonction permettant d'obtenir les propriétés css du composant à retourner
   @return {object}, le flatten style des propriétés css associés aux props du composant react l'object
 */
export function useMediaQueryUpdateStyle({useCurrentMedia,target,mediaQueryUpdateStyle,...props}){
    if(typeof mediaQueryUpdateStyle !=='function') return props.style;
    const dimensions = useWindowDimensions();
    const handleProps = dimensions && useCurrentMedia === true ? Dimensions.getCurrentMedia() : dimensions;
    return useStableMemo(()=>{
        const args = Dimensions.getDimensionsProps();
        args.props = props,
        args.target = target;
        const nStyle = mediaQueryUpdateStyle(args);
        if(isObj(nStyle) || Array.isArray(nStyle)) return StyleSheet.flatten([props.style,nStyle]);
        return StyleSheet.flatten(props.style)||{};
    },[handleProps,useCurrentMedia,dimensions,props.style]);
}