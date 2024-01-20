import {isMobileNative,isAndroid,isIos} from "$cplatform";
import {CardStyleInterpolators,TransitionPresets} from "./Stack";
import Auth from "$cauth";
import { isNonNullString,isObj } from "$cutils";

const sessionKey = "screen-nav-animation-type";

//@see : https://reactnavigation.org/docs/stack-navigator/
export function getAnimationType (){
    return prepareAnimType(Auth.getSessionData(sessionKey));
}
export const setAnimationType = (anim)=>{
    return Auth.setSessionData(sessionKey,prepareAnimType(anim));
}

export const prepareAnimType = (animType)=>{
    if(!isNonNullString(animType) || !animationTypes[animType]){
        animType = isAndroid() ? "FadeFromBottomAndroid" : "DefaultTransition"
    }
    if(!TransitionPresets[animType]){
        for(let i in TransitionPresets){
            if(isObj(TransitionPresets[i])){
                return i;
            }
        }
    }
    return animType;
}

/*** retourne l'animation courante */
export const getAnimation = ()=>{
    const animType = getAnimationType();
    return TransitionPresets[animType] || {};
}

export const animationTypes = isIos()? {
    SlideFromRightIOS : {code:"SlideFromRightIOS",label:"Standard"},
    ModalSlideFromBottomIOS : {code : "ModalSlideFromBottomIOS",label:"Navigation standard"},
    //ModalPresentationIOS : {code : "ModalPresentationIOS",label : "Présentation modal, version iOS >=13"},
    DefaultTransition : {code:"DefaultTransition",label:"Par défaut",default:true},
 } :  isAndroid() ?  {
    FadeFromBottomAndroid : {code:"FadeFromBottomAndroid",label:"Transition haut vers le bas"},
    RevealFromBottomAndroid : {code : "RevealFromBottomAndroid",label : "Animation standard"},
    ScaleFromCenterAndroid : {code:"ScaleFromCenterAndroid",label:"Transition vers le centre, version android > 10"},
    DefaultTransition : {code:"DefaultTransition",label:"Par défaut",default:true}
} : {
    DefaultTransition : {code:"DefaultTransition",label:"Par défaut",default:true},
};
