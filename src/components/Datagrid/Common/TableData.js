import CommonDatagrid from "./Common";
import {defaultObj,defaultStr,isNonNullString,isFunction,isPromise} from "$utils";
//import {mountDatabaseTable,unmountDatabaseTable,unlockTable,isTableLocked} from "$database/utils";
import actions from "$actions";
import PropTypes from "prop-types";
import APP from "$capp";
//import {getDataFunc} from "$database/getData";

export default class CommonTableDatagrid extends CommonDatagrid{
    constructor(props){
        super(props);
        let {
            data,
            tableName,
            table,
            dbName,
            server,
        } = props;
        dbName = CommonDatagrid.getDBName({...props,server,dbName,context:this});
        tableName = defaultStr(tableName,table).toUpperCase();
        if(tableName){
            Object.defineProperties(this,{
                tableName : {value:tableName,override:false,writable:false}
            })
        }
        if(isNonNullString(tableName)){
            data = defaultVal(data,dbName+'['+tableName+']');
            unlockTable(tableName);
            mountDatabaseTable(tableName,dbName);
        }
        this.INITIAL_STATE.fetchData = defaultVal(this.props.fetchData,data);
        let isPv = this.isPivotDatagrid();
        if(isPv){
            isPv = this.props.dbSelector !== false;
        } else isPv = this.props.dbSelector === true ? true : false;
        if(isPv){
            let dbSelectorProps = defaultObj(this.props.dbSelectorProps);
            ['table','tableName'].map((tb,idx)=>{
                dbSelectorProps[tb] = defaultStr(this.props[tb],dbSelectorProps[tb]);
            });
            this.setSessionData({selectedDatabases:this.currentDatabases});
        } else {
            this.currentDatabases = Object.toArray(this.currentDatabases);
        }
        this.state.isLoading = true;
    }

    /*** lorsque la données est modifiée */
    onUpsertData =(arg) =>{
        if(!this._isMounted()) return;
        if(isTableLocked(this.tableName)) {
            return;
        }
        this.isDataJustComeToUpsert = true; ///on empêche d'afficher le progress bar
        this.fetchData(true).finally(()=>{
            this.isDataJustComeToUpsert = undefined;
        });
    }

    componentDidMount(){
        super.componentDidMount();
        APP.extend(this._events,{
            onUpsertData : this.onUpsertData.bind(this),
        });
        if(isNonNullString(this.tableName)){
            APP.on(actions.upsert(this.tableName),this._events.onUpsertData)
            APP.on(actions.onRemove(this.tableName),this._events.onUpsertData)
        }
        this.fetchData(true);
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        if(isNonNullString(this.tableName)){
            unmountDatabaseTable(this.tableName);
            APP.off(actions.upsert(this.tableName),this._events.onUpsertData);
            APP.off(actions.onRemove(this.tableName),this._events.onUpsertData);
        }
        this.clearEvents();
        this.setSelectedRows();
    }

    onChangeDatabases(args){
        let {databases,server} = args;
        this.currentDatabases = databases;
        if(JSON.stringify({databases:this.previousDatabases}) != JSON.stringify({databases})){
            if(isObj(this.props.dbSelectorProps) && isFunction(this.props.dbSelectorProps.onChange)){
                args.datagridContext = this;
                this.props.dbSelectorProps.onChange(args);
            }
            this.refresh(true);
        } 
        this.previousDatabases = databases;
        this.previousServer = server;
    }
    refresh (force,cb){
        if(isFunction(force)){
            let t = cb;
            cb = force;
            force = isBool(t)? t : true;
        }
        force = defaultBool(force,true)
        return this.fetchData(undefined,force).then((data)=>{
            if(isFunction(cb)){
                cb(data);
            }
        })
    }
    getProgressBar(props){
        if(this.isDataJustComeToUpsert) return null;
        return super.getProgressBar(props);
    }
    /**** retourne la liste des items, utile lorsqu'une s'agit d'une fonction 
        Lorsque data est une chaine de caractère, alors elle doit être sous la forme recommandée par la function 
        getDataFunc de l'object database
        la props data, peut être une chaine de caractère contenant le nom de la base et de la bd de travail de l'application
        example common[articles], dans ce cas, la fonction fetchData, aura pour rôle de chercher toutes les données qui match
        la table dans la base common.
        Elle pourra éventuellement passer directement la limite et les filtres à la fonction fetchdata
    */
    fetchData (cb,force,fetchOptions){
        if(!this._isMounted()) return Promise.resolve([]);
        if(this.isFetchingData) {
            if(!isPromise(this.fetchingPromiseData)){
                this.fetchingPromiseData = Promise.resolve([])
            }
            return this.fetchingPromiseData;
        };
        this.isFetchingData = true;
        if(isObj(cb)){
            let t =  cb;
            if(!isObj(fetchOptions)){
                fetchOptions = cb;
            }
            if(isBool(t)){    
                let t1 = force;
                force = t;
                if(isFunction(t1)){
                    cb = t1;
                }
            }
        }
        if(isBool(cb)){
            let t = force;
            force = cb;
            if(isFunction(t)){
                cb = t;
            }
        }
        this.fetchingPromiseData = new Promise((resolve,reject)=>{
            setTimeout(()=>{
                if(typeof cb === 'boolean'){
                    force = cb;
                    cb = undefined;
                }
                if(force !== true && isArray(this.INITIAL_STATE.data)) {
                    return this.resolveFetchedDataPromise({cb,data:this.INITIAL_STATE.data}).then(resolve).catch(reject)
                }
                let fetchData  = this.INITIAL_STATE.fetchData;
                fetchOptions = defaultObj(fetchOptions);
                fetchOptions.selector = defaultObj(fetchOptions.selector);
                fetchOptions.selector.$and = defaultArray(fetchOptions.selector.$and);
                fetchOptions.databases = this.currentDatabases;
                fetchOptions = APP.extend(true,true,{},{selector : this.getFilters()},fetchOptions,this.filtersSelectors);
                fetchOptions.databases = this.currentDatabases;
                let limit = this.getQueryLimit();
                if(limit > 0 && !this.isPivotDatagrid()){
                    fetchOptions.limit = limit;
                } else {
                    if(!isDecimal(fetchOptions.limit) || fetchOptions.limit <=0){
                        delete fetchOptions.limit
                    }
                }
                if(isFunction(this.props.fetchData)){
                    //fetchOptions.limit = defaultNumber(fetchOptions.limit,100);
                    /**** l'on peut définir la props fetchData, qui est la fonction appelée pour la recherche des données */
                    fetchData = this.props.fetchData.call(this,fetchOptions);
                }
                if(isNonNullString(fetchData)) {
                    //fetchData = getDataFunc(fetchData,fetchOptions);
                } 
                fetchData = isFunction(fetchData)? fetchData.call(this,fetchOptions) : fetchData;
                this.updateProgress({isLoading:true},()=>{
                    if(isPromise(fetchData)){
                        return fetchData.then(data=>{
                           return this.resolveFetchedDataPromise({cb,data,force}).then((data)=>{
                                resolve(data);
                            }).catch((e)=>{
                                console.log(e,' fetching datagrid data')
                                reject(e);
                            });
                        }).catch((e)=>{
                            console.log(e," resolve fetching data for datagrid");
                            return this.resolveFetchedDataPromise({cb,data:[],force}).then((data)=>{
                                resolve(data);
                            }).catch((e)=>{
                                console.log(e,' fetching datagrid data')
                                reject(e);
                            });;
                        })
                    } else {
                        let data = !isPromise(fetchData)? Object.toArray(fetchData) : [];
                        if(data.length <=0) data = this.state.data;
                        return this.resolveFetchedDataPromise({cb,data,force}).then((data)=>{
                            resolve(data);
                        }).catch((e)=>{
                            console.log(e,' fetching datagrid data')
                            reject(e);
                        });
                    }     
                });
            },1);
        })
        return this.fetchingPromiseData;
    }
    resolveFetchedDataPromise(arg){
        arg = defaultObj(arg);
        const {cb,data} = arg;
        return new Promise((resolve)=>{
            this.prepareData(arg,(state)=>{
                state.data = Array.isArray(state.data)? state.data : [];
                if(typeof this.props.onFetchData =='function'){
                    this.props.onFetchData({...arg,allData:data,context:this,props:this.props,data:state.data})
                }
                this.setState(state,()=>{
                    if(isFunction(cb)) {
                        cb(data)
                    } 
                    resolve(data);
                    this.isFetchingData = undefined;
                })
            });
        })
    }
}

CommonTableDatagrid.propTypes = {
    ...CommonDatagrid.propTypes,
    data : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
        PropTypes.objectOf(PropTypes.any),
        PropTypes.arrayOf(PropTypes.any)
    ])
}