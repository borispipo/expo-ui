import CommonDatagrid from "./Common";
import {defaultObj,extendObj,defaultStr,isNonNullString,isFunction,isPromise} from "$cutils";
import PropTypes from "prop-types";
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
        if(tableName){
            Object.defineProperties(this,{
                tableName : {value:tableName,override:false,writable:false}
            })
        }
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
    renderProgressBar(props){
        if(this.isDataJustComeToUpsert) return null;
        return super.renderProgressBar(props);
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