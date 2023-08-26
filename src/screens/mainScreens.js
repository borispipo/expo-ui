import Auth from "./Auth";
import Help  from "./Help";
export default  [
    ...Auth,
    ...Help,
]

export const getMainScreens = (handleHelpScreen)=>{
    const screens = [Auth];
    if(handleHelpScreen !== false){
        screens.push(Help);
    }
    return screens;
}

export const screensWithoutHelp = [...Auth];

export {Help};