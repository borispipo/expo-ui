import {isNonNullString,isObj,extendObj,defaultObj,defaultStr} from "$utils";
import { useQuery as useRQuery, useMutation as RQUseMutation, useQueryClient } from "@tanstack/react-query";
import { getFetcherOptions as apiGetFetcherOptions } from '$capi';

export const RETRY_OPTIONS = { cacheTime: 2000,refetchInterval:5000};

export const RETRY_LIST_OPTIONS = {cacheTime:5000,refetchInterval:20000};

const isValidNetworkMode = (nMode)=>isNonNullString(nMode) && ['online','always','offlineFirst'].includes(nMode.toLowerCase().trim());
const isValidRetryDelay = (retryDelay) => typeof retryDelay =='number' || typeof retryDelay ==='function'? true : false;

const queries403Cached = {};

/***** override of useQuery
  @see : https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4
  @see : https://tanstack.com/query/v4/docs/react/reference/useQuery for useQuery options
  @param {boolean} handle403, pour la prise en compte du 403
  @param {Array} key, array of key string, The query key to use for this query.The query key will be hashed into a stable hash. See Query Keys for more information. The query will automatically update when this key changes (as long as enabled is not set to false).
  @param {function} queryFn, query function  (context: QueryFunctionContext) => Promise<TData>
  @param {boolean} enabled  Set this to false to disable this query from automatically running.
  @param {string} networkMode 'online' | 'always' | 'offlineFirst
  @param {boolean| number | (failureCount: number, error: TError) => boolean} retry If false, failed queries will not retry by default.If true, failed queries will retry infinitely. If set to a number, e.g. 3, failed queries will retry until the failed query count meets that number.
  @param {boolean} retryOnMount If set to false, the query will not be retried on mount if it contains an error. Defaults to true.
  @param {number | (retryAttempt: number, error: TError) => number} retryDelay  This function receives a retryAttempt integer and the actual Error and returns the delay to apply before he next attempt in milliseconds.  A function like attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000) applies exponential backoff., A function like attempt => attempt * 1000 applies linear backoff.
*/
export const useQuery = (key,queryFn,enabled,networkMode,retry,retryOnMount,retryDelay,...args)=>{
    const options = isObj(key)? Object.assign({},key) : isNonNullString(key)? {queryKey:key.split(",")} : Array.isArray(key)? {queryKey:key} : {};
    key = isNonNullString(key)? key.split(",") : Array.isArray(key)? key : [];
    options.queryKey = Array.isArray(options.queryKey) && options.queryKey.length && options.queryKey || key;
    options.queryFn = typeof queryFn =='function' ? queryFn : typeof options.queryFn =='function'? options.queryFn : undefined; 
    options.enabled = typeof enabled === "boolean" ? enabled : typeof options.enabled =='boolean' ? options.enabled : true;
    options.networkMode = isValidNetworkMode(networkMode) ? networkMode.toLowerCase().trim() : isValidNetworkMode(options.networkMode) ? options.networkMode.toLowerCase().trim() : "online";
    options.retry = typeof retry =='boolean' || typeof retry ==='number' ? retry : typeof options.retry ==='boolean' || typeof options.retry =='number' ? options.retry : undefined;
    options.retryOnMount = typeof retryOnMount ==='boolean'? retryOnMount : typeof options.retryOnMount =='boolean' ? options.retryOnMount : undefined;
    options.retryDelay = isValidRetryDelay(retryDelay)? retryDelay : isValidRetryDelay(options.retryDelay) ? options.retryDelay : undefined;
    [queryFn,enabled,networkMode,retry,retryOnMount,retryDelay].map((a)=>{
      isObj(a) && extendObj(true,options,a);
    }); 
    args.map((a)=>{
      isObj(a) && extendObj(true,options,a);
    });
    options.enabled = !options.queryKey?.length ? false : options.enabled;
    //if not enabled, we have to disabled retry option
    options.retry = !options.enabled ? false : options.retry;
    const {onError} = options;
    const keyString = key.join(",");
    if(keyString && queries403Cached[keyString]){
      options.retry = false;
    }
    const {handle403} = options;
    delete options.handle403;
    options.onError = (e,...args)=>{
      if(handle403){
        const {response} = isObj(e)? e : {};
        if(isObj(response) && response.status === 403){
          keyString ? queries403Cached[keyString] = true : null;
          setTimeout(()=>{
            keyString && delete queries403Cached[keyString];
          },100);
        }
      }
      if(typeof onError ==='function' && (onError(e,options) === false)) return;
    }
    //const r = !options.enabled ? console.error("unable to get query for options",options) : null;
    return useRQuery(options);
}

/**** 
  @see : https://tanstack.com/query/v4/docs/react/reference/useMutation
*/
export const useMutation = (mutationFn,cacheTime,mutationKey,...args)=>{
    const options = isObj(mutationFn)? Object.assign({},mutationFn) : typeof(mutationFn) =='function'? {mutationFn} : {};
    mutationFn = typeof mutationFn ==='function' ? mutationFn : undefined;
    mutationFn = mutationFn || typeof options.mutationFn == 'function' ? options.mutationFn : undefined;
    options.cacheTime = typeof cacheTime =='number' ? cacheTime : typeof options.cacheTime =='number'? options.cacheTime : undefined; 
    options.mutationKey = isNonNullString(mutationKey) && mutationKey || isNonNullString(options.mutationKey) ? options.mutationKey : undefined;
    [cacheTime,mutationKey].map((a)=>{
      isObj(a) && extendObj(true,options,a);
    }); 
    args.map((a)=>{
      isObj(a) && extendObj(true,options,a);
    });
    options.mutationFn = async (params,...rest) => {
        return await mutationFn(params,...rest);
    }
    return RQUseMutation(options);
}


export const getFetcherOptions = (path,opts)=>{
  return apiGetFetcherOptions(path,opts);
}