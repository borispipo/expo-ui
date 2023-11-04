import {createContext,useContext,useState,useEffect,useMemo} from "react";
import APP from "$capp/instance";
import {sanitizeName} from '$cnavigation';

const MainNavigationContext = createContext(null);

export const useMainNavigation = ()=>{
    return useContext(MainNavigationContext);
}

export const MainNavigationProvider = ({children,...props})=>{
    return <MainNavigationContext.Provider value = {props} children={children}/>
}

/*****
    appélé lorsqu'un écran est focus
    @param {string} screenName, le nom de l'écran en question
    @return {boolean}, pour indiqué si l'écran est focused
*/
export const useIsScreenFocused = (screenName)=>{
    const sanitizedName = sanitizeName(screenName);
    if(!sanitizeName) return false;
    const [isFocused,setIsFocused] = useState(false);
    useEffect(()=>{
        const toggle = (setFocus)=>{
            setIsFocused(setFocus);
        }, check = (sName,rName)=>{
            return sName === sanitizedName || rName === screenName;
        }
        const onScreenFocus = ({sanitizedName:sName,screenName:rName})=>{
            toggle(check(sName,rName));
        },onScreenBlur = ({sanitizedName:sName,screenName:rName})=>{
            toggle(!check(sName,rName));
        };
        APP.on(APP.EVENTS.SCREEN_FOCUS,onScreenFocus);
        APP.on(APP.EVENTS.SCREEN_BLUR,onScreenBlur);
        return ()=>{
            APP.off(APP.EVENTS.SCREEN_FOCUS,onScreenFocus);
            APP.off(APP.EVENTS.SCREEN_BLUR,onScreenBlur);
        }
    },[])
    return useMemo(()=>isFocused,[isFocused]);
}