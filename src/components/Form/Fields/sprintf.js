import selectors from "./sprintfSelectors";
import {isNonNullString,defaultFunc,isObj,isPromise} from "$cutils";

export default  ({value,val,formatter,cb,success,...rest})=>{
    val = defaultStr(value,val)
    if(!isNonNullString(val)){
        return null;
    } 
    cb = defaultFunc(cb,success);
    let keys = [];
    for(let i in selectors){
        if(!isObj(selectors[i])) continue;
        if(val.contains(i)){
            keys.push(i);
        } else if(val.contains(i.toUpperCase())){
            keys.push(i.toUpperCase())
        }
    }
    const results = {};
    let length = keys.length;
    let index = length;
    let key = undefined
    const sKeys = {};
    return new Promise((resolve)=>{
        const next = ()=>{
            index -=1;
            if(index < 0){
                for(let i in results){
                    let indexName = i.toLowerCase();
                    let selector = selectors[indexName];
                    if(!selector){
                        indexName = i.toUpperCase();
                        selector = selectors[indexName];
                    }
                    const replace = results[i];
                    if(typeof formatter =='function'){
                        val = formatter({selectors,selector,value:val,replace,result:results[i],results,indexName,selectorIndex:indexName,selectorName:indexName})
                    }
                    if(typeof val =='string' && typeof replace =='string'){
                        val = val.replaceAll(i,replace);
                    }
                }
                val = defaultStr(val);
                cb(val);
                resolve(val);
            } else {
                key = keys[index];
                if(!isNonNullString(key)) {return next();}
                let indexName = key.toLowerCase();
                let selector = selectors[indexName];
                if(!selector){
                    indexName = key.toUpperCase();
                    selector = selectors[indexName];
                }
                sKeys[key] = indexName;
                const select = isObj(selector)? selector.select : selector;
                if(typeof cb =='function'){
                    const v = select({...rest,selector,selectors,indexName,selectorIndex:indexName,selectorName:indexName,results,index:key,keys,key,value:val});
                    if(isPromise(v)){
                        return v.then((r)=>{
                            if(typeof r ==='string'){
                                results[key] = r;
                            }
                        }).finally(next);
                    } else if(typeof v =='string' || typeof v =='number'){
                        results[key] = v.toString();
                    }
                }
                next();
            }
        }
        next();
    })
}
