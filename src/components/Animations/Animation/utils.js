import {defaultStr,isObj} from "$utils";
import PropTypes from "prop-types";
import {FadeIn,FadeInRight,FadeInLeft,FadeInUp,FadeInDown,SlideInRight,SlideInLeft,SlideInUp,SlideInDown} from "react-native-reanimated"; 
import {FadeOut,FadeOutRight,FadeOutLeft,FadeOutUp,FadeOutDown,SlideOutRight,SlideOutLeft,SlideOutUp,SlideOutDown} from "react-native-reanimated";

export const InAnimations = {FadeIn,FadeInRight,FadeInLeft,FadeInUp,FadeInDown,SlideInRight,SlideInLeft,SlideInUp,SlideInDown};
export const OutAnimations = {FadeOut,FadeOutRight,FadeOutLeft,FadeOutUp,FadeOutDown,SlideOutRight,SlideOutLeft,SlideOutUp,SlideOutDown};

/*** les types d'animations pris en compte */
export const supportedTypes = {
    fade : 'fade', slide : 'slide'
}

/***
 * @param inOrOut {string : in |out}, spécifie si c'est une animation entrante ou non
 * @param type {string}, le type de l'animation exemple : fade | slide
 * @param position {string}, la position de l'animation ('','up','left','right','down')
 *      lorque la position n'est pas définie, les seules animations supportées sont fadeIn et FadeOut
 */
export function getInOrOutAnimation (inOrOut,type,position){
    inOrOut = defaultStr(inOrOut,'in').toLowerCase();
    if(inOrOut !== 'in' && inOrOut !=='out'){
        inOrOut = 'in';
    }
    const isIn = inOrOut == 'in'? true : false;
    type = defaultStr(type,'fade').trim().toLowerCase();
    if(!supportedTypes[type]){
        type = supportedTypes.fade;
    }
    let animationName = type.ucFirst()+inOrOut.ucFirst();
    position = defaultStr(position).trim().toLowerCase();
    if(position){
        const a = animationName+position.ucFirst();
        if(isIn){
            return InAnimations[a] || undefined;
        }
        return OutAnimations[a] || undefined;
    } 
    return isIn ? FadeIn : FadeOut;
}

/*** retourne un composant react-native-animated en fonction du type passé en paramètre
 * 
 */
export const getInAnimation = (type,position)=>{
    return getInOrOutAnimation('in',type,position);
}

export const getOutAnimation = (type,position)=>{
    return getInOrOutAnimation('out',type,position);
}

/**** retourne un objet constitué des animations à utiliser en entrant et en sortant
 * @param type {string} le type de l'animation
 * @param position {string} la position de l'animation
 */
export const getAnimations = (type,position) =>{
    return {
        entering : getInAnimation(type,position),
        exiting : getOutAnimation(type,position),
    }
}

export const animationTypePropTypes = PropTypes.oneOf([
    'none','slide', 'fade'
]);

export const animationPositionPropTypes = PropTypes.oneOf([
    "","up","right","left","down",
]);


export const animationsPropTypes = {
    animationType : animationTypePropTypes,
    animationPosition : animationPositionPropTypes,
    animationDuration : PropTypes.number,
    animationDelay : PropTypes.number,
}