import { Dimensions } from "react-native";
import {defaultObj,defaultNumber} from "$cutils";

export const MIN_ITEM_HEIGHT = 50;

export const ITEM_HEIGHT = 100;

export const SINGLE_LINE_HEIGHT = 30;

export const getSingleLineHeight = (opts)=>{
    if(typeof opts =='number' && opts > 150){
        opts = {itemWindowWidth:opts};
    }
    opts = typeof opts =="object" && opts ? opts : {};
    const itemWindowWidth = defaultNumber(opts.itemWindowWidth,Dimensions.get('window').width);
    if(itemWindowWidth >= 350) {
        return 29;
    } else if(itemWindowWidth >= 300){
        return 30;
    }
    return Math.max(Math.floor(itemWindowWidth/5),40);
}