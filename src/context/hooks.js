import Dimensions from "$cplatform/dimensions";
import useStableMemo  from "$react/useStableMemo";
import { useWindowDimensions } from "$cdimensions";
import {isObj,isNonNullString,extendObj} from "$cutils";
import { StyleSheet } from "react-native";
import { createContext,useContext as useReactContext } from "react";
import _useSWR from "$swr";
export const ExpoUIContext = createContext(null);

export const useExpoUI = ()=> (useReactContext(ExpoUIContext) || {});

export default useExpoUI;

export const useContext = useExpoUI;

export const useApp = useContext;

export const ScreenContext = createContext(null);

export const useScreen = x=>useReactContext(ScreenContext);
export const useIsScreenFocused = x=>{
    const s = useScreen();
    return !!(isObj(s) && typeof s.isFocused ==="function" && s.isFocused()) || false
}
export const hasScreenContext = x=>!!useScreen();

export const useSWR =  (path,options)=>{
    const {swrConfig} = useExpoUI();
    const host = `${defaultStr(process.env.API_HOST).trim().rtrim("/")}/${path}`;
    const isLocalHost = host.includes("127.0.0.1") || host.includes("localhost");
    return _useSWR(path,{
        checkOnline : !isLocalHost,
        ...Object.assign({},options),
        swrOptions : {
            provider: () => new Map(),
            keepPreviousData : true,
            ...swrConfig,
            isOnline(...rest) {
                if(isLocalHost) return true;
                return swrConfig.isOnline(...rest);
            },
            initReconnect(cb) {
                if(isLocalHost) return cb();
                return swrConfig.initReconnect(cb);
            },
            ...extendObj({},options,options?.swrOptions)
        }
    })
}


/**** retourne un composant définit dans la props
    components de la fonction registerApp appelée pour l'initialisation de l'application
    @param {string} componentName : le nom du composant que l'on veut recupérer
*/
export const useAppGetComponent = (componentName)=>{
    if(!isNonNullString(componentName)) return null;
    componentName = componentName.trim();
    const {components} = useExpoUI();
    const camCase = componentName.toCamelCase();
    const lowerFirst = camCase.lowerFirst();
    return components[componentName] ||  components[componentName.toLowerCase()]  || components[componentName.ucFirst()] || components[camCase] || components[lowerFirst] || components[componentName.toUpperCase()] || null;
}

export const useAppComponent = useAppGetComponent;

export const useGetComponent = useAppComponent;

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