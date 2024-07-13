import session from "$session";
import './uuid/deps';
import {useState,useEffect} from "$react";
import Provider from "$econtext/Provider";
import App from "./AppEntry";
/****
 * les options sont de la forme : 
 * {
 *   @param init {function} ()=>Promise<{}>, initialise l'application, lorsque la promèsse n'est pas résolue, alors l'application considère qu'il s'agit d'une étape pour l'écran de GetStarted dans ce cas, 
 *   l'option la route getStartedRouteName est utilisée comme route par défaut de l'application
 *   @param initialRouteName {string} la route initiale, par d'afaut Home, valide lorsque la promèsse résultat de la fonction init est résolue
 *   @param getStartedRouteName {string} la route de l'écran de GetStarted, valide lorsque la promèsse résultat de la fonction init n'est pas résolue
 *      L'écran de route getStartedRouteName prend en paramètre onGetStarted {function}, qui est appelée lorsque le contenu de l'écran GetStarted est affiché à l'utilisateur
 *   @maram {swrConfig}, les options supplémentaires à passer au gestinnaire swr
 *   les écrans d'initialisation doivent garder la propriété Start à true ou doivent avoir le groupe INTALL, pour spécifier que ce sont es écrans qui apparaissent lorsque l'application n'est pas initialisée
 * }
 */

export default function ExpoUIAppEntryProvider({children:cChildren,init,...rest}){
    const [children,setChildren] = useState(null);
    const canInit = typeof session.init =="function";
    useEffect(()=>{
        if(!canInit) return ()=>{}
        Promise.resolve(session.init()).finally(()=>{
            return setChildren(<Provider {...rest}>
                <App init={init} children={cChildren}/>
            </Provider>);
        });
    },[]);
    return canInit ? children : <Provider {...rest}><App init={init} children={cChildren}/></Provider>;
}


export * from "./context";