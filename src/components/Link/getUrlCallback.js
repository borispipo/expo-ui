import { defaultStr } from "$utils";
import { getCurrentURI,getNativeMobileAppURI } from "$utils/uri";
export default function getCallbackUrl (url){
    let cUrl = undefined;
    if (typeof window !== 'undefined' && window) {
       cUrl = getCurrentURI();
    } else {}
    url = defaultStr(url,cUrl);
    return getNativeMobileAppURI(url);
  }