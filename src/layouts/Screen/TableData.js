import {defaultStr,isNumber,isPromise,defaultVal,extendObj,defaultObj,uniqid,isObj,isObjOrArray} from "$cutils";
import {FormData} from "$ecomponents/Form";
import FormDataScreen from "./FormData";
import ScreenContainer from "./Screen";
import React from "$react";
import { StyleSheet} from "react-native";
import ScrollView from "$ecomponents/ScrollView";
import PropTypes from "prop-types";
import notify from "$notify";
import Auth from "$cauth";
import {open as showPreloader,close as hidePreloader} from "$preloader";
import {canMakePhoneCall, makePhoneCall as makePCall} from "$app/makePhoneCall";
import copyToClipboard from "$app/clipboard";
import {isMobileOrTabletMedia} from "$platform/dimensions";
import Tab  from "$ecomponents/Tab";
import View from "$ecomponents/View";
import {goBack as navGoBack} from "$cnavigation";
import {renderTabsContent,renderActions} from "./utils";
import theme from "$theme";
import cActions from "$cactions";
import APP from "$capp/instance";
import { generatedColumnsProperties,defaultArchivedPermsFilter } from "./utils";
import {isDocEditing,checkPrimaryKey} from "$ecomponents/Form";
import i18n from "$i18n";
import fetch from "$capi/fetch";
import appConfig from "$capp/config";
import {Vertical} from "$ecomponents/AutoSizer";


const HIDE_PRELOADER_TIMEOUT = 300;

const DEFAULT_TABS_KEYS = "main-tabs";

const TIMEOUT = 50;

const defaultRendersTypes = ["mobile","desktop"];


export default class TableDataScreenComponent extends FormDataScreen{
    constructor(props){
        super(props);
        extendObj(this.state,this.prepareStateData(this.props));
        this.hidePreloader = this.hidePreloader.bind(this);
        this.showPreloader = this.showPreloader.bind(this);
        const table = this.getTableObj();
        Object.defineProperties(this,{
            tableName : { value : defaultStr(table.table,table.tableName)},
            table : {value : table},
        })
        this.init();
    };
    /**** retourne l'objet table, associé à la tableName */
    getTableObj(){
        const table = defaultObj(this.props.table);
        if(Object.size(table,true)) return table;
        if(typeof appConfig.getTable ==='function'){
            return appConfig.getTable(defaultStr(this.props.tableName,this.props.table));
        }
        return {};
    }
    getNewElementLabel(...args){
        const tableObj = this.getTableObj();
        return tableObj?.newElementLabel ? tableObj?.newElementLabel : super.getNewElementLabel(...args);
    }
    init(){
        const table = this.getTableObj();
        const fields = {},primaryKeyFields = {};
        Object.map(table.fields,(field,i)=>{
            if(isObj(field) && field.form !== false){
                fields[i] = Object.clone(field);
                const f = fields[i];
                f.type = defaultStr(f.jsType,f.type).toLowerCase();
                const name = f.field = defaultStr(f.field,i);
                if((f.type =='id' || f.type =='piece' || f.primaryKey || f.unique === true) && f.unique !== false && f.disabled !== true && f.readOnly !== true){
                    const {onBlur} = f;
                    f.onBlur = (args)=>{
                        if(isNonNullString(args.value)){
                            args.value = args.value.trim();
                        }
                        args = {...f,...args,fetch,columnField:name,fieldName:name,id:args.value};
                        const {context} = args;
                        const r = typeof onBlur =='function'? onBlur (args) : undefined;
                        if(r === false || (!args.value && typeof args.value != 'number')) return r;
                        //on applique la validation seulement en cas de non mise à jour
                        if(!this.isCurrentDocEditingUpdate() && context && typeof context.onNoValidate =='function'){
                            const cb = typeof field.fetchUniqueId =='function'? field.fetchUniqueId : this.fetchUniqueId.bind(this);
                            if(cb){
                                const r2 = cb(args);
                                (isPromise(r2)? r2 : Promise.resolve(r2)).then((data)=>{
                                    let message = data;
                                    if(isObj(data) && Object.size(data,true)){
                                        message = i18n.lang('validate_rule_field_must_be_unique')+ defaultStr(f.label,f.text);
                                    }
                                    if(isNonNullString(message)){
                                        context.onNoValidate({...args,msg:message,message,context,validRule:context.getValidRule()});
                                    }
                                }).catch((e)=>{
                                    if(e && e.status?.toString() == '404') return;
                                    console.log(e," fetching unique id on table data element id : ",args)
                                    const message = defaultStr(e?.message,e?.msg);
                                    if(message){
                                        context.onNoValidate({...args,msg:message,message,error:e,context,validRule:context.getValidRule()});
                                    }
                                });
                            }
                        }
                        return r;
                    }
                }
                if(field.primaryKey === true){
                    primaryKeyFields[field.field || i] = true;
                }
            } else {
                fields[i] = field;
            }
        });
        Object.defineProperties(this,{
            fields : {value : fields},
            archivedPermsFilterFunc : {value : typeof this.props.archivedPermsFilter =='function'? this.props.archivedPermsFilter:defaultArchivedPermsFilter},
            isDocEditingRef : {value : {current:false}},
            closeOnSaveProp : {value : this.props.closeOnSave || this.props.closeAfterSave },
            //la liste des champ de type clé primaire associés à la table
            primaryKeyFields : {value : primaryKeyFields},
            showPreloaderOnUpsert : {value : this.props.showPreloaderOnUpsert},
        });
    }
    prepareStateData(props){
        const mainProps = defaultObj(props,this.props);
        const hasManyData = isObjOrArray(mainProps.datas) && Object.size(mainProps.datas,true) > 0 ? true : false;
        let cDatas = [];
        if(hasManyData){
            cDatas = Object.toArray(mainProps.datas);
        }
        return {
            hasManyData,
            datas : cDatas,
            currentIndex : 0,
            data : hasManyData ? defaultObj(cDatas[0]) : isObj(mainProps.data)? mainProps.data : {}
        };
    }
    fetchUniqueId(...args){
        const fetch = typeof this.props.fetchUniqueId =='function'? this.props.fetchUniqueId : undefined;
        if(fetch){
            return fetch(...args);
        }
        return undefined;
    }
    isCurrentDocEditingUpdate(){
        return this.isDocEditingRef.current === true ? true : false;
    }

    getDatas(){
        return this.state.datas;
    }
    hasManyData (){
        return this.state.hasManyData;
    }
    getCurrentData(){
        return defaultObj(this.state.data);
    }
    /**** retourne les props en cours d'édition */
    getCurrentRenderingProps (){
        return defaultObj(this.currentRenderingProps);
    }
    /* Attention, cette méthode est appélée dans la méthode getComponentProps de la classe parente. 
    *  Tenir de cette information capitale pour bien négocier l'appel de la dite méthode. Elle permet de retourner 
    *  les permissions particulière qu'aura l'utilisateur sur les actions de la tableData
    * cette fonction est appelée, pour retourner les permissions qu'à l'utilisateur sur les ressource
    * Elle doit retourner un objet de la forme : 
    *  {
    *      create || write : boolean
    *      edit || update : boolean
    *  }
    *  @param {
    *      perm {string} : la chaine de caractère traduisant la permission et pouvant être passée en paramètre 
    *      isUpdate : booléan spécifiant s'il s'agit d'une mise à jour du document actuel   
    *      tableName : chaine de caractère contenenant le nom de la table associée à la tableData
    *      context || le context qui execute la fonction courante  
    *      datas: la liste des données passées à la TableData
    *  }
    */
    getActionsPerms(args){
        const eProps = this.getCurrentRenderingProps();
        const gPA = typeof eProps.getActionsPerms =='function'? eProps.getActionsPerms : typeof this.props.getActionsPerms =='function'? this.props.getActionsPerms : undefined;
        const permsR = gPA ? gPA.call(this,args) : null;
        const {perm,action,tableName} = args;
        const ePerms = (isNonNullString(perm)? Auth.isAllowed({resource:perm.split(':')[0],action}):Auth.isTableDataAllowed({table:tableName,action}));
        return isObj(permsR) ? extendObj({},ePerms,permsR) : ePerms;
    }
    getRenderedActionPrefix (){}
    renderActions(args,...rest){
        if(typeof this.props.renderActions =="function"){
            return this.props.renderActions(args,...rest);
        }
        return null;
    }
    isLoading(){
        return !!(this.getCurrentRenderingProps().isLoading) || !!this.props.isLoading;
    }
    /**** permet de preparer les composant props
        si la fonction retourne un élément react, alors l'élément react est rendu comme résultat du composant
    */
    prepareComponentProps(props){
        const obj = typeof this.props.prepareComponentProps =='function'? this.props.prepareComponentProps(props) : null;
        if(isObj(obj) && Object.size(obj,true)){
            return extendObj({},props,obj);
        }
        return props;
    }
    getSessionName (){
        return defaultStr(this.props.sessionName,"table-form-data"+this.getTableName())
    }
    prepareField(a,...args){
        if(typeof this.props.prepareField =='function'){
            return this.props.prepareField(a,...args);
        }
        return a;
    }
    isUpdate(...args){
        return this.isDocUpdate(...args);
    }
    isDocUpdate(){
        const t = this.currentRenderingProps;
        if(isObj(t) && 'isUpdate' in t) return t.isUpdate;
        return this.isDocEditing(this.getCurrentData());
    }
    getComponentProps(props){
        const table = this.table;
        const {datas,currentIndex,data} = this.state; 
        const tableName = this.tableName;
        const isUpdated = this.isDocEditing(data);
        this.isDocEditingRef.current = !!isUpdated;
        const isMobOrTab = this.isMobileOrTabletMedia();
        let archived = this.isArchived(); 
        const fields = {};
        const {
            actions,
            fields:preparedFields,
            onKeyEvent,
            canMakePhoneCall : customCanMakePhoneCall,
            makePhoneCallProps : customMakePhoneCallProps,
            closeOnSave,closeAfterSave,
            table : cTable,
            onSave,
            onSaveTableData,
            clone,
            isArchivable,clonable,isPrintable,print,data:customData,getRowKey,
            save2newAction,
            newAction,
            save2cloneAction,
            saveAction,
            save2closeAction,
            cloneAction,
            children,
            Component,
            tabs : customTabs,
            firstTabProps,
            sessionName : customSessionName,
            contentProps : customContentProps,
            elevation,
            appBarProps : customAppBarProps,
            containerProps : customContainerProps,
            formProps : customFormProps,
            newElementLabel,
            prepareField,
            prepareComponentProps,
            ...rest
        } = this.prepareComponentProps({...props,tableName,context:this,fields:extendObj(true,{},this.fields,props.fields),isUpdated,isUpdate:isUpdated,data,datas,currentIndex});
        const sessionName = this.getSessionName();
        const generatedColumnsProps = this.getGeneratedColumnsProperties();
        ///on effectue une mutator sur le champ en cours de modification
        Object.map(preparedFields,(field,i,counterIndex)=>{
            const currentField = isObj(field)?Object.clone(field):field;
            if(isObj(field)){
                const columnField = defaultStr(currentField.field,i);
                /**** lorsqu'un champ porte la propriété visibleOnlyOnEditing  à true alors ce champ sera disponible uniquement en cas de modification */
                if(currentField.visibleOnlyOnEditing === true && !isUpdated){
                    currentField.form = false;
                }
                generatedColumnsProps.map((f)=>{
                    //on affiche les champs générés uniquement  en cas de mise à jour
                    if(currentField[f] === true){
                        currentField.visible = isUpdated ? true : false;
                        currentField.readOnly = true;
                    }
                });
                const cArgs = {field:currentField,columnField,columnDef:currentField,isUpdate:isUpdated,name:columnField,index:i,counterIndex,isPrimary,fields:preparedFields,contex:this,data:this.getCurrentData(),datas,currentIndex,isUpdated,tableName,table};
                if(isUpdated){
                    //la props readOnlyOnEditing permet de rendre le champ readOnly en cas de mise à jour de la tableData
                    const readOnlyOnEditing = typeof currentField.readOnlyOnEditing =='function'? currentField.readOnlyOnEditing(cArgs) : currentField.readOnlyOnEditing;
                    if((readOnlyOnEditing === true)){
                        currentField.readOnly = true;
                    }
                    const disabledOnEditing = typeof currentField.disabledOnEditing =='function'? currentField.disabledOnEditing(cArgs) : currentField.disabledOnEditing;
                    if((disabledOnEditing === true)){
                        currentField.disabled = true;
                    }
                    const visibleOnlyOnCreate = typeof currentField.visibleOnlyOnCreate =='function'? currentField.visibleOnlyOnCreate(cArgs) : currentField.visibleOnlyOnCreate;
                    if((visibleOnlyOnCreate === false)){
                        currentField.form = false;
                    }
                    if(currentField.primaryKey === true){
                        currentField.readOnly = true;
                    }
                }
                if(field.primaryKey ===true){
                    this.primaryKeyFields[columnField] = true;
                }
                const isPrimary = this.primaryKeyFields[columnField] && true || false;
                const f = this.prepareField(cArgs);  
                if(f === false) {
                    delete fields[i];
                    return;
                }
                
            }
            fields[i] = currentField;
        });
        const context = this;
        const formProps = ({
            ...defaultObj(customFormProps),
            archived,
            data,
            isUpdate : isUpdated,
            isUpdated,
            fields,
        });
        const canNew = this.canCreateNew() && newAction !== false;
        const cCloneAction = this.isClonable() && canNew && clonable !== false && cloneAction !== false && true || false;
        const rActionsArg = this.currentRenderingProps = {
            ...rest,
            ...formProps,
            context,
            newAction,
            cloneAction : cCloneAction,
            save2newAction : canNew ? typeof save2newAction =="boolean"? save2newAction : saveAction !== false : false,
            save2cloneAction : cCloneAction && save2cloneAction !== false ? true : false,
            isMobile : isMobOrTab,
            saveAction,
            save2closeAction : typeof save2closeAction ==="boolean"? save2closeAction : saveAction !== false,
            tableName,
            sessionName,
            table,
            newElementLabel : this.getNewElementLabel(),
            printable : (typeof rest.printable ==='boolean' ? rest.printable : true) && this.isPrintable(),///si la table data est imprimable,
            canMakePhoneCall : this.canMakePhoneCall(),
            makePhoneCallProps:this.getMakePhoneCallProps(),
            onPressToMakePhoneCall : this.makePhoneCall.bind(this),
            archivable : (typeof rest.archivable ==='boolean' ? rest.archivable : true) && this.isArchivable(),
            saveButton : isUpdated?'Modifier':'Enregistrer',
            currentData:data,
            hasManyData : this.hasManyData(),
            //onPressToPrint : this.print.bind(this),
            datas,
            currentDataIndex:currentIndex,
            onPressToPrevious:this.goToPreviousData.bind(this),
            onPressToArchive : this.doSave.bind(this),
            onSave : undefined,
            onPressToCreateNew : this.createNew.bind(this),
            onPressToNext:this.goToNextData.bind(this),
            archivedPermsFilter : this.archivedPermsFilter.bind(this),
            onPressCopyToClipboard : this.copyToClipboard.bind(this)
        }
        if(Object.size(fields,true)){
            if(isUpdated){
                fields.approved = this.isApprovable()? {
                    text : 'Approuvé',
                    type : 'switch',
                    defaultValue : 0,
                    checkedTooltip: 'Oui',
                    disabled : Auth.isTableDataAllowed({table:tableName,action:'updateapproved'})? false:true,
                    uncheckedTooltip : 'Non',
                    ...Object.assign({},fields.approved)
                } : null;
            }
        } else {
            formProps.style = [theme.styles.noPadding,formProps.style]
        }
        rActionsArg.contentProps = Object.assign({},customContentProps);
        rActionsArg.containerProps = Object.assign({},customContainerProps);
        formProps.onKeyEvent = this.onKeyEvent.bind(this);
        rActionsArg.elevation = typeof rActionsArg.contentProps.elevation ==="number"? contentProps.elevation : typeof elevation == 'number' ? elevation : 5;
        rActionsArg.formProps = formProps;
        if(typeof this.props.getComponentProps =='function'){
            const p = this.props.getComponentProps(rActionsArg);
            if(isObj(p)){
                this.currentRenderingProps = p;
                return p;
            }
        }
        return rActionsArg;
    }
    /*** retourne la liste des colones générées comme createdDate,updateDate et bien d'autres */
    getGeneratedColumnsProperties(){
        return generatedColumnsProperties;
    }
    renderTabs(args){
        const tabs = this.props.tabs;
        if(typeof tabs =='function'){
            return tabs(args);
        }
        return tabs;
    }
    handleCustomRender(){
        return true;
    }
    canRenderActions(props){
       return (this.props.renderActions !== false && this.currentRenderingProps?.renderActions !== false && props?.renderActions !== false); 
    }
    componentWillRender({...rActionsArg}){
        rActionsArg.context = this;
        const rActions = this.canRenderActions(rActionsArg)? renderActions.call(this,rActionsArg) : {};
        const renderedActs = this.renderActions(rActionsArg);
        if(!rActionsArg.archived){
            const customActionKeyPrefix = this.getRenderedActionPrefix();
            const iPrefix = customActionKeyPrefix === false ? "" : defaultStr(customActionKeyPrefix,"zact")
            Object.map(renderedActs,(a,i)=>{
                rActions[iPrefix+i] = a;
            });
        }
        rActionsArg.actions = this.buttonsActions = rActions;
        return rActionsArg;
    }
    _render ({header,content,context}){
        const restProps = this.getCurrentRenderingProps();
        delete restProps.tabs;
        let {tabProps,firstTabProps,tabsProps,withScrollView} = restProps;
        let testID = this.props.testID;
        tabsProps = defaultObj(tabsProps);
        tabsProps.tabContentProps = defaultObj(tabsProps.tabContentProps);
        tabsProps.tabContentProps.stopChildrenEventPropagation = typeof tabsProps.tabContentProps.stopChildrenEventPropagation =="function" ? tabsProps.tabContentProps.stopChildrenEventPropagation : false;
        tabsProps.tabItemsProps = defaultObj(tabsProps.tabItemsProps);
        if(typeof withScrollView =='boolean' && typeof tabsProps.withScrollView !=='boolean'){
            tabsProps.withScrollView = withScrollView;
        }
        restProps.tabsProps = tabsProps;
        restProps.tabProps = tabProps = defaultObj(tabProps);
        const tabs = this.renderTabs(restProps);
        const tabKey = this.getTabsKey();
        const isMobOrTab = this.isMobileOrTabletMedia();
        tabsProps.tabContentProps.autoHeight = typeof tabsProps.tabContentProps.autoHeight =="boolean"? tabsProps.tabContentProps.autoHeight : isMobOrTab;
        const contentProps = restProps.contentProps;
        const renderingTabsProps = {tabs,data:this.getCurrentData(),isMobile:isMobOrTab,sessionName:this.getSessionName(),props:restProps,tabProps,tabsProps,context,tabKey};
        const hasTabs = Object.size(tabs,true);
        let mainContent = undefined;
        testID = defaultStr(testID,"RN_TableDataScreenItem_"+restProps.tableName);
        firstTabProps = extendObj({},tabProps,firstTabProps);
        if(hasTabs){
            if(isMobOrTab){
                renderingTabsProps.firstTab = <Tab.Item testID={testID+"_MainTab"} label={"Principal"} {...firstTabProps} key={tabKey}>
                    <View testID={testID+"_MainTab_Content"} {...contentProps} style={[styles.noMargin,contentProps.style,styles.h100,styles.noPadding]}>
                        {header}
                        {content}
                    </View>
                </Tab.Item>
            } else {
                //tabsProps.tabItemsProps.elevation = 0;
            }
            const ct = renderTabsContent(renderingTabsProps);
            if(isMobOrTab && ct){
                contentProps.style = [contentProps.style,styles.noMargin,styles.noPadding,styles.content]
                mainContent = ct;
            } else {
                mainContent = <Vertical  {...contentProps} testID={testID+"_ContentContainer"} style={[styles.container,styles.noPadding,contentProps.style]}>
                    <ScrollView  testID={testID+"_MainContentScrollView"} contentProps={{style:theme.styles.p1}}>
                        <View testID={testID+"_ContentHeader"} style={[styles.screenContent,theme.styles.p1,header?styles.screenContentWithHeader:null]}>
                            {header}
                            {content}
                        </View>
                        {ct ? <View {...contentProps} testID={testID+"_DesktopContentTabs"} style={[contentProps.style]}>
                            {ct}
                        </View> : null}
                    </ScrollView>
                </Vertical>
            }
        } else {
            mainContent = <ScrollView testID={testID+"_MainContentScrollViewWithoutTab"}>
                <View testID={testID+"_MainContent"} style={[styles.screenContent,!isMobOrTab && theme.styles.p1,header?styles.screenContentWithHeader:null]}>
                    {header}
                    {content}
                </View>
            </ScrollView>
        }
        const appBarProps = this.getAppBarActionsProps(restProps);
        if(hasTabs && isMobOrTab){
            appBarProps.elevation = 0;
            restProps.elevation = 0;
        }
        return <ScreenContainer backgroundColor={theme.surfaceBackground}  {...restProps} appBarProps = {appBarProps} testID={testID}>
            {this.wrapRenderingContent(mainContent,{testID})}
        </ScreenContainer>
    }
    wasTransferred(data){
        data = defaultObj(data,this.state.data);
        return !!data.wasTransferred;
    }
    getCurrentIndex (){
        return this.state.currentIndex;
    }
    isArchivable(){
        const editingProps = this.getCurrentRenderingProps();
        if(typeof editingProps.archivable =='boolean') return editingProps.archivable;
        return !!this.props.archivable;
    }
    isArchived(data){
        data = defaultObj(data,this.state.data);
        return this.isArchivable() && this.isDocEditing(data) && (!!data.archived || !!data.wasTransferred)? true : !!this.props.archived || false;
    }
    goToPreviousData(){
        const currentIndex = this.getCurrentIndex(),datas = this.state.datas;
        if(!this._isMounted() || !this.hasManyData() || currentIndex <= 0) return;
        clearTimeout(this.timeoutCallback);
        this.timeoutCallback = setTimeout(()=>{
            const cIndex = currentIndex -1;
            if(isObj(datas[cIndex])){
                this.showPreloader();
                this.setState({currentIndex:cIndex,data:datas[cIndex]},this.hidePreloader);
            }
        },TIMEOUT);
    }
    goToNextData = ()=>{
        const currentIndex = this.getCurrentIndex(),datas = this.state.datas;
        if(!this._isMounted() || !this.hasManyData() || currentIndex >= this.state.datas.length-1) return;
        clearTimeout(this.timeoutCallback);
        this.timeoutCallback = setTimeout(()=>{
            const cIndex = currentIndex +1;
            if(isObj(datas[cIndex])){
                this.showPreloader();
                this.setState({currentIndex:cIndex,data:datas[cIndex]},this.hidePreloader);
            }
        },TIMEOUT);
    }
    getTabsKey(k){
        let key = DEFAULT_TABS_KEYS;
        k = isNumber(k) ? k : 0;
        if(this.hasManyData()){
            return this.getCurrentIndex()+k;
        }
        return key+k;
    }
    isApprovable(){
        return false;
    }
    getCurrentEditingData(data){
        return this.isDocEditing(data)? data : isObj(data) && Object.size(data,true) ? extendObj({},this.getCurrentData(),data) : this.getCurrentData();
    }
    approve (data){
        if(!this.isApprovable()) return;
        data = this.getCurrentEditingData(data);
        data.approved = 1;
        this.clickedEl = "save";
        this.doSave({data});
        return true;    
    }
    isPrintable(){
        return !!(this.props.printable);
    }
    /*** retourne la liste des valeurs de clé primarire associés à la table data pour la données en cours de modification 
     * Elle permet d'afficher dans la barre de titre, les identifiants de la table de données en cours de modification
    */
    getPrimaryKeysFieldsValueText(data){
        data = defaultObj(data,this.getCurrentData());
        const v = [];
        Object.map(this.primaryKeyFields,(vv,f)=>{
            if(typeof data[f] =='number' || (typeof data[f] =='string' && data[f])){
                v.push(data[f]);
            }
        });
        return v.join(" ");
    }
    isDocEditing(data){
        data = defaultObj(data);
        const isDocEditingCb = typeof this.props.isDocEditing =='function'? this.props.isDocEditing : typeof this.props.isDocUpdate =='function'? this.props.isDocUpdate : undefined;
        if(!isDocEditingCb){
            if(isDocEditing(data,this.primaryKeyFields,({index:field,data})=>{
                return checkPrimaryKey(data,field);
            })) return true;
        } else {
            return isDocEditingCb(data,{context:this});
        }
        return super.isDocEditing(data);
    }
    print(data){   
        if(!this.isPrintable() && typeof this.props.print !=='function') return;
        data = this.isDocEditing(data)? data : isObj(data) && this.isDocEditing(data.data)? data.data : {};
        return this.props.print(data,this);
    }
    isClonable(){
        return !!(this.props.clonable !==false);
    }
    clone (data){
        if(!this._isMounted() || !this.isClonable())return data;
        data = {...this.getCurrentEditingData(data)};
        if(typeof this.props.clone ==='function' && this.props.clone(data,this) === false) return data;
        this.showPreloader();
        delete data.approved;
        Object.map(['_rev','_id',this.getGeneratedColumnsProperties(),...Object.keys(this.primaryKeyFields)],(idx)=>{
            data[idx] = undefined;
            delete data[idx];
        });
        this.setState({data,hasManyData:false,datas:[],currentIndex:0},this.hidePreloader);
        return data;
    }
    showPreloader(content){
        return showPreloader(content||'traitement en cours...');
    }
    hidePreloader(timeoutCallback){
        clearTimeout(this.hidePreloaderTimeout);
        this.hidePreloaderTimeout = setTimeout(()=>{
            clearTimeout(this.hidePreloaderTimeout);
            hidePreloader();
        },typeof timeoutCallback =='number'? timeoutCallback : HIDE_PRELOADER_TIMEOUT);
        return this.hidePreloaderTimeout;
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        const {data,datas}= nextProps;
        if(!React.areEquals({data,datas},{data:this.state.data,datas:this.state.datas})){
            this.setState(this.prepareStateData(nextProps));
        }
        return;
    }
    reset (args,...rest){
        if(!this._isMounted()) return;
        super.reset(args,...rest)
        clearTimeout(this.timeoutCallback);
        this.showPreloader();
        this.timeoutCallback = setTimeout(()=>{
            args = defaultObj(args);
            args.data = defaultObj(args.data)
            const currentIndex = this.getCurrentIndex();
            if(args.reset !== true && this.hasManyData() && Object.size(args.data,true)){
                const cData = [...this.state.datas]
                cData[currentIndex] = args.data;
                this.setState({data:args.data,datas:cData,currentIndex},this.hidePreloader);
            } else {
                this.setState({data:args.data,datas:[],hasManyData:false,currentIndex:0},this.hidePreloader);
            }
        },TIMEOUT);
    }

    /**** si l'on peut appeler la props onSuccess après vouloir cliquer sur le bouton  enregistrer les données depuis la formData*/
    canCallOnSuccess(){
        return true;
    }
    upsertToDB(args){
        if(typeof this.props.upsertToDB ==='function'){
            return this.props.upsertToDB(args);
        }
        return Promise.resolve({});
    }
    getDataProp(){
        return Object.assign({},this.getCurrentData());
    }
    getAppBarActionsProps(props){
        return {...super.getAppBarActionsProps(props),actions:this.buttonsActions,data:this.getCurrentData()}
    }
    /**** cette fonction est appelée immédiatement lorsque l'on clique sur le bouton enregistrer de l'un des actions du formulaire */
    onPressToSaveFormData(args){
        return this.doSave(args);
    }
    canCreateNew(){
        return this.props.newAction !== false;
    }
    isMobileOrTabletMedia(){
        const r = this.getRenderTabsType();
        if(r =="mobile") return true;
        if(r =="desktop") return false;
        return isMobileOrTabletMedia();
    }
    getRenderTabsType (){
        const r = defaultStr(this.props.renderTabsType).toLowerCase();
        if(!r || !(defaultRendersTypes.includes(r))) return "responsive";
        return r;
    }
    createNew(){
        return this.reset();
    }
    archive(){}
    validateData(args){
        if(typeof this.props.validateData =='function'){
            return this.props.validateData(args);
        }
        return true;
    }
    onSaveTableData(){}
    /*** permet de recherger le contenu du form avec la données passée en paramètre
        @param {object} currentData, la nouvelle donnée en cours de modification
        @param {function} callback, la fonction de rappel à appeler une fois que la données a été mise à jour
        @return {this} le contexte
    */
    reloadCurrentData(currentData,callback){
        currentData = isObj(currentData)? currentData : {};
        if(this.hasManyData() && Array.isArray(this.state.datas)){
            const sData = [...this.state.datas];
            sData[this.state.currentIndex] = currentData;
            return this.setState({data:currentData,datas:sData},callback);
        } else {
            return this.setState({data:currentData,datas:[],hasManyData:false},callback);
        }
    }
    doSave ({goBack,data,action}){
        const cb = ()=>{
            if(action === 'new'){
                this.reset();
                return false;
            }
            if(action =='makePhoneCall'){
                this.makePhoneCall(data);
                return false;
            }
            if(action === 'print'){
                this.print(data);
                return false;
            }
            if(action === 'archive'){
                this.archive(data);
                return false;
            }
            if(action === 'clone'){
                this.clone({...data});
                return false;
            }
            const isUpdated = this.isDocEditing(data);
            let isPOpened = true;
            const closePreloader = ()=>{
                if(isPOpened && this.showPreloaderOnUpsert !==false){
                    hidePreloader();
                }
                isPOpened = false;
            }
            const close = ()=>{
                closePreloader();
                goBack = typeof goBack =='function'? goBack : navGoBack;
                if(typeof goBack =='function'){
                    goBack(true);
                }
            }
            if(this.showPreloaderOnUpsert !== false){
                showPreloader(this.getConfirmTitle()+"\n"+(isUpdated?'Modification':'Enregistrement')+" en cours...");
            }
            const hasManyData = this.hasManyData();
            const context = this;
            const tableName = this.tableName;
            const upToDB = this.upsertToDB({data,table:this.table,tableName,context});
            if(isPromise(upToDB)){
                upToDB.then((upserted)=>{
                    const willCloseAfterSave =  action === 'save2close' || !hasManyData;
                    let hasUpserted = this.isDocEditing(upserted);
                    if(!hasUpserted && isObj(upserted) && isObj(upserted.data) && this.isDocEditing(upserted.data)){
                        upserted = upserted.data;
                        hasUpserted = true;
                    }
                    const savedData = hasUpserted? upserted : data;
                    const newArgs = {tableName,actionName:action,action,table:this.table,data:savedData,result:upserted,context};
                    APP.trigger(cActions.upsert(tableName),newArgs);
                    if(this.onSaveTableData(newArgs) === false || (isFunction(this.props.onSave)&& this.props.onSave(newArgs) === false)){
                        closePreloader();
                        return;
                    }
                    const isSave2Print = action =="save2print";
                    let forceClose = this.closeOnSaveProp || isSave2Print;
                    if(forceClose){
                        close();
                        if(isSave2Print){
                            setTimeout(()=>{
                                this.print(savedData);
                            },TIMEOUT);
                        }
                    }
                    if(action == 'save2new'){
                        this.reset();
                    } else if(action === 'save'){
                        this.reset({data:savedData});
                    } else if(action === 'save2clone'){
                        this.clone(savedData);
                        return;
                    } else if(willCloseAfterSave) {
                        close();
                    } else {
                        notify('Données modifiée avec succès!!','success');
                    }
                    if(hasUpserted){
                        this.reloadCurrentData(savedData,closePreloader);
                    }
                    closePreloader();
                }).catch((e)=>{
                    console.log('error on saving table data ',e);
                    closePreloader();
                });
            } else {
                closePreloader();
            }
        }
        action = defaultStr(action,this.clickedEl);
        const isValid = this.validateData({data,action,context:this});
        if(isNonNullString(isValid)){
            return notify.error(isValid);
        }
        if(isValid === false) return;
        if(isPromise(isValid)){
            isValid.then((r)=>{
                if(isNonNullString(r)){
                    return notify.error(r);
                } else if(r === false) return;
                cb();
            }).catch(notify.error);
        } else {
            cb();
        }
        return false;
    }
    onKeyEvent(event){
        event = super.onKeyEvent(event);
        if(!isObj(event)) return;
        if(isObj(this.buttonsActions) && isObj(event.formKeyEventAction) && isNonNullString(event.formKeyEventAction.action)){
            let fke = event.formKeyEventAction;
            let button = this.buttonsActions[fke.action];
            this.clickedEl = fke.action;
            if(isObj(button)){
                if(fke.action == 'previous'){
                    this.goToPreviousData();
                } else if(fke.action =="next"){
                    this.goToNextData();
                } else {
                    let f = this.getForm();
                    if(isObj(f) && f.isValid && f.isValid()){
                        const data = f.getData();
                        switch(fke.action){
                            case 'print':
                                this.print(data);
                                break;
                            default : 
                                this.clickedEl = fke.action;
                                this.doSave({data});
                                break;
                        }
                    } else {
                        notify.warning("Impossible d'enregistrer le document. Rassurez vous de remplir les champs nécesaires afin qu'il soit valide.");
                    }
                }
            }
        }
    }
    canMakePhoneCall(){
        if(!canMakePhoneCall()) return false;
        const table = this.table;
        if(table.canMakePhoneCall) return true;
        return isObj(table.datagrid) ? !!table.datagrid.canMakePhoneCall  : false;
    }
    getTableName(){
        return this.tableName;
    }
    getTableText(){
        const tableObj = this.getTableObj();
        return defaultStr(tableObj?.text,tableObj?.label);
    }
    getTableLabel(){
        return this.getTableText();
    }
    getMakePhoneCallProps (){
        const table = this.table;
        const makePhoneCallProps = defaultVal(this.props.makePhoneCallProps,table.makePhoneCallProps);
        const rowData = this.getCurrentData();
        const mP = typeof makePhoneCallProps === 'function' ? makePhoneCallProps({rowData,data:rowData,isTableData:true,props:this.props,context:this,table,tableName:this.table}) : makePhoneCallProps;
        return mP !== false ? defaultObj(mP) : null;
    }
    makePhoneCall(data){
        const mP = this.getMakePhoneCallProps();
        if(!this.canMakePhoneCall() || !canMakePhoneCall() || !isObj(mP)) return false;
        makePCall(defaultObj(data || this.getCurrentData()),mP);
        return false;
    }
   
    /*** archivedPermsFilter est la fonction permettant de filtres les permissions qui par défaut ne figurent pas parmis les permissions en readOnly
     * si archivedPermFilter retourne true pour une permission données alors cette permission sera ignorée
    */
    archivedPermsFilter (...args){
        return !!this.archivedPermsFilterFunc(...args);
    };
    copyToClipboard(){
        return copyToClipboard({
            data : this.getCurrentData(),
            fields : this.getCurrentRenderingProps()?.fields,
            sessionName : this.getSessionName(),
        });
    }
    renderDatagridActions(args){
        args = defaultObj(args);
        let {datagrid,filterAction} = args
        let ret = [];
        if(this.isDocEditing(args.data) && isObj(datagrid) && typeof (datagrid.selectedRowsActions) ==='function'){
            filterAction = defaultFunc(filterAction,(x)=>true);
            Object.map(datagrid.selectedRowsActions({selectedRows : {[this.getRowKey(data,0)]:args.data},Auth}),(v,i)=>{
                if(isObj(v) && filterAction(v,i)){
                    ret.push({...v},i);
                }
            })  
        }
         return ret;
    }
    getAppBarTitle (){
        const editingProps = this.getCurrentRenderingProps();
        return React.isValidElement(editingProps.title,true) && editingProps.title || React.isValidElement(this.props.title,true) && this.props.title || this.table.text || this.table.label || null;
    }
    getAppBarProps(a){
        const r = super.getAppBarProps(a);
        r.title  = this.getAppBarTitle();
        if(this.hasManyData()){
            r.title +=" ["+(this.state.currentIndex+1)+"/"+this.state.datas.length+"]";
        }
        return r;
    }
}




TableDataScreenComponent.propTypes = {
    ...defaultObj(FormData.propTypes),
    renderTabsType : PropTypes.oneOf([...defaultRendersTypes,undefined,"responsive"]),//spécifie le type de rendue : mobile, alors le tab sera rendu en mobile, desktop, ce sera rendu en desktop, responsible ou undefined, alors les deux rendu seront possible
    prepareComponentProps : PropTypes.func, //permet d'appreter les components props à utiliser pour le rendu des données
    prepareField : PropTypes.func,//La fonction permettant de faire des mutations sur le champ field à passer au formulaire form. si elle retourne false alors la field ne sera pas pris een compte
    unique : PropTypes.bool,//si la validation de type unique sur le champ sera effective
    fetchUniqueId : PropTypes.func,//la fonction permettant de fetch un élément unique pour la validation de type uniqueID, liée aux champs de type piece et id
    validateData : PropTypes.func,// la fonction permettant de valider les données à enregistrer
    archivedPermsFilter : PropTypes.func,///le filtre des permissions archivées, elle permet de laisser uniquement les permissions de faire un filtre sur les permission et ne laisser que celle qui sont considérées comme disposible en cas de document archivé
    newElementLabel : PropTypes.string,//le titre du bouton nouveau pour l'ajout d'un nouvel élément
    customActionKeyPrefix : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
    ]), //le préfix par défaut à utiliser pour préfixer les actions supplémentaires du FormDataScreen. important pour un ordre personalisé des actions du composant
    formName : PropTypes.string,//le nom de la formnanem qui rend le contenu du table data
    onSave : PropTypes.func, ///lorsque la données est enregistrée
    onSaveTableData : PropTypes.func,
    closeOnSave : PropTypes.bool,
    closeAfterSave : PropTypes.bool,
    beforeSave : PropTypes.func,
    canMakePhoneCall : PropTypes.bool,
    makePhoneCallProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]),
    fields : PropTypes.objectOf(PropTypes.object),
    tabs : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
        PropTypes.func,
    ]),
    children : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element,
    ]),
    showPreloaderOnUpsert : PropTypes.bool,//Si le preloader sera afficher en cas d'insertion/modification
}

const styles = StyleSheet.create({
    noPadding : {
        padding:0,
        paddingTop : 0,
        paddingBottom : 0,
        paddingHorizontal : 0,
        paddingVertical : 0,
    },
    noMargin : {
        margin : 0,
        marginVertical : 0,
        marginHorizontal : 0,
    },
    container : {
        paddingVertical : 10,
        paddingHorizontal : 10,
    },
    content : {
        
    },
    screenContent : {
        padding : 0,
        paddingBottom : 10,
    },
    screenContentWithHeader : {
        marginTop : 0,
        paddingTop:0,
    },
    h100 : {
        height:'100%'
    }
});
TableDataScreenComponent.displayName = "TableDataScreenComponent"