import CommonDatagrid from "./Common";
import {defaultObj,extendObj,defaultStr,isNonNullString,isFunction,isPromise} from "$utils";
import PropTypes from "prop-types";

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
        this.fetchData({force:true});
    }

    componentWillUnmount(){
        super.componentWillUnmount();
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
    fetchData ({cb,callback,force,fetchOptions}){
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
                if(force !== true && isArray(this.INITIAL_STATE.data)) {
                    return this.resolveFetchedDataPromise({cb,data:this.INITIAL_STATE.data}).then(resolve).catch(reject)
                }
                const fetchFilters = this.getFilters();
                fetchOptions = isObj(fetchOptions)?Object.clone(fetchOptions):{};
                fetchOptions.selector = defaultObj(fetchOptions.selector);
                fetchOptions.dataSources = this.currentDataSources;
                fetchOptions = extendObj(true,true,{},fetchOptions,{selector : fetchFilters});
                fetchOptions.dataSources = this.currentDataSources;
                fetchOptions.sort = this.state.sort;
                let limit = this.getQueryLimit();
                if(limit > 0 && !this.isPivotDatagrid()){
                    fetchOptions.limit = limit;
                } else {
                    if(!isDecimal(fetchOptions.limit) || fetchOptions.limit <=0){
                        delete fetchOptions.limit
                    }
                }
                this.beforeFetchData(fetchOptions);
                if(typeof this.props.beforeFetchData =='function' && this.props.beforeFetchData({context:this,fetchOptions,options:fetchOptions}) === false){
                    this.isFetchingData = false;
                    return resolve(this.state.data);
                }
                let fetchData  = this.INITIAL_STATE.fetchData;
                if(isFunction(this.props.fetchData)){
                    /**** l'on peut définir la props fetchData, qui est la fonction appelée pour la recherche des données */
                    fetchData = this.props.fetchData.call(this,fetchOptions);
                }
                fetchData = isFunction(fetchData)? fetchData.call(this,fetchOptions) : fetchData;
                this.updateProgress(true,()=>{
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