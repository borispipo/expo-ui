import CommonDatagrid from "./Common";
import {defaultObj,extendObj,defaultStr,isNonNullString,isFunction,isPromise} from "$utils";
import PropTypes from "prop-types";
import {convertToSQL} from "$ecomponents/Filter";
import actions from "$actions";
/**** 
 *      la fonction fetchOptionsMutator permet éventuellemnt de faire une mutations sur les options fetchOptions avant qu'elle ne soit appliquée pour la recherche. elle
 *      est appelée avant que la fonction convertToSQL ne soit appelée, bien évidemement si la props convertToSQL est active pour le datagrid
 *      la fonction beforeFetchData est appelée immédiatement avant l'execution de la requête fetch et après que la fonction converttoSQL soit appelée
 */
export default class CommonTableDatagrid extends CommonDatagrid{
    constructor(props){
        super(props);
        let {
            tableName,
            table,
            dataSource,
        } = props;
        dataSource = CommonDatagrid.getDataSource({...props,dataSource,context:this});
        tableName = defaultStr(tableName,table).toUpperCase();
        this.prepareFetchData();
        if(tableName){
            Object.defineProperties(this,{
                tableName : {value:tableName,override:false,writable:false}
            })
        }
    }
    prepareFetchData(fetchData){
        this.INITIAL_STATE.fetchData = defaultVal(fetchData,this.props.fetchData);
    }
    /*** lorsque la données est modifiée */
    onUpsertData =(arg) =>{
        if(!this._isMounted()) return;
        this.isDataJustComeToUpsert = true; ///on empêche d'afficher le progress bar
        this.fetchData({force:true}).finally(()=>{
            this.isDataJustComeToUpsert = undefined;
        });
    }

    componentDidMount(){
        super.componentDidMount();
        extendObj(this._events,{
            onUpsertData : this.onUpsertData.bind(this),
        });
        if(isNonNullString(this.tableName)){
            APP.on(actions.upsert(this.tableName),this._events.onUpsertData)
            APP.on(actions.remove(this.tableName),this._events.onUpsertData)
        }
        this.fetchData({force:true});
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        if(isNonNullString(this.tableName)){
            APP.off(actions.upsert(this.tableName),this._events.onUpsertData);
            APP.off(actions.remove(this.tableName),this._events.onUpsertData);
        }
        this.clearEvents();
        this.setSelectedRows();
    }
    isTableData(){
        return true;
    }
    
    getProgressBar(props){
        if(this.isDataJustComeToUpsert) return null;
        return super.getProgressBar(props);
    }
    /**** retourne la liste des items, utile lorsqu'une s'agit d'une fonction 
        Lorsque data est une chaine de caractère, alors elle doit être sous la forme recommandée par la function 
        getDataFunc de l'object dataSource
        la props data, peut être une chaine de caractère contenant le nom de la base et de la bd de travail de l'application
        example common[articles], dans ce cas, la fonction fetchData, aura pour rôle de chercher toutes les données qui match
        la table dans la base common.
        Elle pourra éventuellement passer directement la limite et les filtres à la fonction fetchdata
    */
    fetchData ({cb,callback,force,fetchOptions,...rest}){
        if(!this._isMounted()) return Promise.resolve(this.state.data);
        if(this.isFetchingData) {
            if(!isPromise(this.fetchingPromiseData)){
                this.fetchingPromiseData = Promise.resolve(this.state.data)
            }
            return this.fetchingPromiseData;
        };
        this.isFetchingData = true;
        cb = typeof cb =='function'? cb : typeof callback =='function'? callback : undefined;
        this.fetchingPromiseData = new Promise((resolve,reject)=>{
            setTimeout(()=>{
                if(typeof cb === 'boolean'){
                    force = cb;
                    cb = undefined;
                }
                fetchOptions = this.getFetchOptions({fetchOptions,convertToSQL:false});
                if(typeof this.props.fetchOptionsMutator =='function' && this.props.fetchOptionsMutator(fetchOptions) === false){
                    this.isFetchingData = false;
                    return resolve(this.state.data);
                }
                this.beforeFetchData(fetchOptions);
                if(this.willConvertFiltersToSQL()){
                    fetchOptions.selector = convertToSQL(fetchOptions.selector);
                }
                if(typeof this.props.beforeFetchData =='function' && this.props.beforeFetchData({...rest,context:this,force,fetchOptions,options:fetchOptions}) === false){
                    this.isFetchingData = false;
                    return resolve(this.state.data);
                }
                if(force !== true && isArray(this.INITIAL_STATE.data)) {
                    return this.resolveFetchedDataPromise({cb,data:this.INITIAL_STATE.data}).then(resolve).catch(reject)
                }
                let fetchData  = this.INITIAL_STATE.fetchData;
                if(isFunction(this.props.fetchData)){
                    /**** l'on peut définir la props fetchData, qui est la fonction appelée pour la recherche des données */
                    fetchData = this.props.fetchData.call(this,fetchOptions);
                }
                fetchData = isFunction(fetchData)? fetchData.call(this,fetchOptions) : fetchData;
                this.setIsLoading(true,()=>{
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
                        ///if(data.length <=0) data = this.state.data;
                        return this.resolveFetchedDataPromise({cb,data,force}).then((data)=>{
                            resolve(data);
                        }).catch((e)=>{
                            console.log(e,' fetching datagrid data')
                            reject(e);
                        });
                    }     
                },true);
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
                    this.isRenderingRef.current = false;
                    this.isFetchingData = undefined;
                    this.setIsLoading(false,false);
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