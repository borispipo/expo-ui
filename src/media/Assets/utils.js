import { Asset} from 'expo-asset';
import {isObj,isNonNullString} from "$cutils";

export const loadAsset = async (asset)=>{
    if(isObj(asset) && isAssets(asset)){
        return Promise.resolve(asset);
    }
    return await new Promise((resolve,reject)=>{
        try {
            Asset.loadAsync(asset).then((index)=>{
                if(isAssets(index[0])){
                    resolve(index[0]);
                } else {
                    reject({message:"ressource non trouvée",asset:index})
                }
            }).catch(reject);
        } catch(e){
            reject(e);
        }
    })
}
export const load = loadAsset;

export const isAssets = (asset,staticAssets)=>{
    return isObj(asset) && "width" in (asset) && "height" in (asset) && isNonNullString(asset.uri) && (staticAssets ? asset.uri.contains("/static/"):true);
}
export const isValid = isAssets;
export const isValidAssets = isAssets;