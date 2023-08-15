import {isNonNullString} from "$cutils";
import * as events from "./evx";

export const sanitize = (event)=>{
    if(!isNonNullString(event)) return "";
    return event.trim().toSnackCase();
}
export * from "./evx";

export default events;

