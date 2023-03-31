import { isValidUrl, isNonNullString,uniqid,defaultObj,defaultStr} from "$cutils";
import getCallbackUrl from "./getUrlCallback";
import { getQueryParams,setQueryParams} from "$cutils/uri";
const BROWSERS_EVENTS = {};
const callbackURIID = "callbackURIIDDD";

const Browser = {
    open : (opts)=>{
        if((isNonNullString(opts) && opts.startsWith("/")) || isValidUrl(opts)){
            opts = {url:opts};
        }
        return;
    }
}


export default Browser;