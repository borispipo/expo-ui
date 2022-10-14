import { Dimensions } from "react-native";
import {isDecimal} from "$utils";

export const getContentHeight = (innerRef,cb,screenIndent)=>{
    return new Promise ((resolve)=>{
        const ref = innerRef && typeof innerRef.measureInWindow =='function'? innerRef : 
        innerRef.current && typeof innerRef.current.measureInWindow ==='function'? innerRef.current : undefined;
        if(ref){
            ref.measureInWindow((x, y, width, height)=>{
                const result = {layout:{x,y,width,height}};
                if(isDecimal(y) && isDecimal(height)){
                    const winHeight = Dimensions.get("window").height;
                    const rHeight = winHeight - defaultDecimal(y) - defaultDecimal(height) - defaultDecimal(screenIndent,20);
                    result.height = rHeight > 200 ? rHeight : undefined;
                }
                if(typeof cb =='function'){
                    cb(result);
                }
                resolve(result)
            })
        } else {
            if(typeof cb =='function'){
                cb({});
            }
            resolve({})
        }
    })
} 

export const measureLayout = getContentHeight;