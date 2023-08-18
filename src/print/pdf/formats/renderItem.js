import {isNonNullString} from '$cutils';
export default ({item}) =>{
    let t = isNonNullString(item.code) ? "[{0}]".sprintf(item.code) : "";
    if(isNonNullString(item.label)){
        return "{0} {1}".sprintf(t,item.label);
    }
    return t;
}