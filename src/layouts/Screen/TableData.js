import {defaultStr,isNumber,isPromise,defaultVal,extendObj,defaultObj,uniqid,isObj,isObjOrArray} from "$utils";
import stableHash from "stable-hash";
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
import Surface from "$ecomponents/Surface";
import View from "$ecomponents/View";
import {goBack as navGoBack} from "$cnavigation";
import {renderTabsContent,renderActions} from "./utils";
import theme from "$theme";
import cActions from "$cactions";
import APP from "$capp/instance";
import { generatedColumnsProperties } from "./utils";
import i18n from "$i18n";
import fetch from "$capi/fetch";


const HIDE_PRELOADER_TIMEOUT = 300;

const DEFAULT_TABS_KEYS = "main-tabs";

const TIMEOUT = 50;

const checkPrimary = (data,f)=>{
    return !(!(f in data) || (data[f] == null) || (!data[f] && typeof data !=='number'));
}
/*** vérifie si le document passé en paramètre est éditable
 * @param {object} data la données à vérifier
 * @param {object| array} les champs sur lesquels se baser pour vérifier si la donénes est une mise à jour
 * @param {func} checkPrimaryKey la foncition permettant de vérifier s'il s'agit d'une clé primaire pour la données courante
 */
export const isDocEditing = (data,fields,checkPrimaryKey)=>{
    if(!isObj(data) || !isObjOrArray(fields)) return false;
    
            let hasPrimaryFields = false;
            let hasValidated = true;
            for(let i in fields){
                const field = fields[i];
                if(typeof checkPrimaryKey =='function') {
                    hasPrimaryFields = true;
                    if(checkPrimaryKey({field,i,index:i,data}) === false){
                        return false;
                    }
                    continue;
                }
                if(!isObj(field)) continue;
                hasPrimaryFields = true;
                const f = defaultStr(field.field,i);
                if(field.primaryKey === true){
                    if(!checkPrimary(data,f)){
                        hasValidated = false;
                    }
                }
            }
            if(hasPrimaryFields){
                return hasValidated;
            }
    return false;
}

export default class TableDataScreenComponent extends FormDataScreen{
    constructor(props){
        super(props);
        const mainProps = props;
        extendObj(this.state,this.prepareStateData(mainProps));
        const table = defaultObj(mainProps.table);
        const fields = {},primaryKeyFields = {};
        Object.map(table.fields,(field,i)=>{
            if(isObj(field) && field.form !== false){
                fields[i] = Object.clone(field);
                const f = fields[i];
                f.type = defaultStr(f.jsType,f.type).toLowerCase();
                const name = f.field = defaultStr(f.field,i);
                if((f.type =='id' || f.type =='piece' || f.unique === true) && f.unique !== false && f.disabled !== true && f.editable !== false && f.readOnly !== true){
                    const {onBlur} = f;
                    f.onBlur = (args)=>{
                        args = {...f,...args,fetch,columnField:name,fieldName:name,id:args.value};
                        const {context} = args;
                        const r = typeof onBlur =='function'? onBlur (args) : undefined;
                        if(r === false) return r;
                        //on applique la validation seulement en cas de non mise à jour
                        if(!this.isCurrentDocEditingUpdate() && context && typeof context.onNoValidate =='function'){
                            const cb = typeof field.fetchUniqueId =='function'? field.fetchUniqueId : typeof this.fetchUniqueId =='function'? this.fetchUniqueId : undefined;
                            if(cb){
                                const r2 = cb(args);
                                if(isPromise(r2)){
                                    r2.then((data)=>{
                                        let message = data;
                                        if(isObj(data) && Object.size(data,true)){
                                            message = i18n.lang('validate_rule_field_must_be_unique')+ defaultStr(f.label,f.text);
                                        }
                                        if(isNonNullString(message)){
                                            context.onNoValidate({...args,msg:message,message,context,validRule:context.getValidRule()});
                                        }
                                    }).catch((e)=>{
                                        const message = defaultStr(e?.message,e?.msg);
                                        if(message){
                                            context.onNoValidate({...args,msg:message,message,error:e,context,validRule:context.getValidRule()});
                                        }
                                    })
                                } 
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
            INITIAL_STATE : {value : {}},
            tableName : { value : defaultStr(table.table,table.tableName)},
            fields : {value : fields},
            table : {value : table},
            isDocEditingRef : {value : {current:false}},
            validateDataBeforeSave : {value : mainProps.validateData},
            upsertDataToDB : {value : mainProps.upsertToDB},
            makePhoneCallProps : {value : mainProps.makePhoneCallProps},
            onSaveProp : {value : mainProps.onSave},
            titleProp : {value : mainProps.title},
            closeOnSaveProp : {value : mainProps.closeOnSave || mainProps.closeAfterSave },
            newActionProp : {value : mainProps.newAction},
            fetchUniqueId : {value : mainProps.fetchUniqueId},
            //la liste des champ de type clé primaire associés à la table
            primaryKeyFields : {value : primaryKeyFields},
            cloneProp : {value : typeof mainProps.clone =='function' && mainProps.clone || undefined},
            printProp : {value : typeof mainProps.print =='function' && mainProps.print || undefined},
            archiveProp : {value : typeof mainProps.archive =='function' && mainProps.archive || undefined },
            testIDProp : {value : defaultStr(mainProps.testID)},
            showPreloaderOnUpsert : {value : mainProps.showPreloaderOnUpsert},
            isDocEditingProp : {value : typeof mainProps.isDocEditing =='function'? mainProps.isDocEditing : typeof mainProps.isDocUpdate =='function'? mainProps.isDocUpdate : undefined}
        });
        this.hidePreloader = this.hidePreloader.bind(this);
        this.showPreloader = this.showPreloader.bind(this);
    };
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
    isCurrentDocEditingUpdate(){
        return this.isDocEditingRef.current === true ? true : false;
    }
    resetState(){
        Object.map(this.INITIAL_STATE,(s,k)=>{
            delete this.INITIAL_STATE[k];
        })
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
    getCurrentEditingProps (){
        return defaultObj(this.INITIAL_STATE.props);
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
    getActionsPerms({perm,action,tableName}){
        return (isNonNullString(perm)? Auth.isAllowed({resource:perm.split(':')[0],action}):Auth.isTableDataAllowed({table:tableName,action}));
    }
    getRenderedActionPrefix (){}
    renderActions(){
        return null;
    }
    getComponentProps(props){
        this.resetState();
        const {
            actions,
            fields:customFields,
            onKeyEvent,
            canMakePhoneCall : customCanMakePhoneCall,
            makePhoneCallProps : customMakePhoneCallProps,
            beforeSave,
            closeOnSave,closeAfterSave,
            table : cTable,
            onSave,
            onSaveTableData,
            clone,
            isArchivable,clonable,isPrintable,print,data:customData,getRowKey,
            save2newAction,
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
            ...rest
        } = props;
        const table = this.table;
        const {datas,currentIndex,data} = this.state; 
        const tableName = this.tableName;
        const sessionName = this.INITIAL_STATE.sessionName = defaultStr(customSessionName,"table-form-data"+tableName);
        const isUpdated = this.isDocEditing(data);
        this.isDocEditingRef.current = !!isUpdated;
        const isMobOrTab = isMobileOrTabletMedia();
        let archived = this.isArchived(); 
        this.INITIAL_STATE.archived = archived;
        this.INITIAL_STATE.tableName = tableName;
        const fields = {};
        Object.map(this.fields,(field,i,counterIndex)=>{
            let currentField = isObj(field)?Object.clone(field):field;
            if(isObj(field)){
                const type = currentField.type = defaultStr(currentField.jsType,currentField.type,"text").toLowerCase();
                /**** lorsqu'un champ porte la propriété visibleOnlyOnEditing  à true alors ce champ sera disponible uniquement en cas de modification */
                if(currentField.visibleOnlyOnEditing === true && !isUpdated){
                    currentField.form = false;
                }
                generatedColumnsProperties.map((f)=>{
                    //on affiche les champs générés uniquement  en cas de mise à jour
                    if(currentField[f] === true){
                        currentField.visible = isUpdated ? true : false;
                        currentField.readOnly = true;
                    }
                });
                if(isUpdated){
                    //la props readOnlyOnEditing permet de rendre le champ readOnly en cas de mise à jour de la tableData
                    if((currentField.readOnlyOnEditing === true)){
                        currentField.readOnly = true;
                    }
                    if((currentField.disabledOnEditing === true)){
                        currentField.disabled = true;
                    }
                }
                
            }
            fields[i] = currentField;
        })
        if(isObj(customFields)){
            extendObj(true,fields,customFields);
        }
        ///on effectue une mutator sur le champ en cours de modification
        if(typeof prepareField =='function'){
            Object.map(fields,(field,i,counterIndex)=>{
                if(!isObj(field)) return;
                const name = defaultStr(field.field,i);
                const isPrimary = this.primaryKeyFields[name] && true || false;
                const f = prepareField({field,columnField:name,columnDef:field,isUpdate:isUpdated,name,index:i,counterIndex,isPrimary,fields,contex:this,data,datas,currentIndex,isUpdated,tableName,table});  
                if(f === false) {
                    delete fields[i];
                }
            });
        }
        const context = this;
        const formProps = ({
            ...defaultObj(customFormProps),
            archived,
            data,
            isUpdate : isUpdated,
            isUpdated,
            fields,
        });
        const rActionsArg = this.INITIAL_STATE.props = {
            ...rest,
            ...formProps,
            context,
            save2newAction : this.canCreateNew() && save2newAction !== false ? true : false,
            isMobile : isMobOrTab,
            saveAction,
            save2closeAction,
            cloneAction : this.isClonable() && clonable !== false ? cloneAction : false,
            tableName,
            sessionName,
            table,
            newElementLabel : this.getNewElementLabel(),
            printable : this.isPrintable(),///si la table data est imprimable,
            canMakePhoneCall : this.canMakePhoneCall(),
            makePhoneCallProps:this.getMakePhoneCallProps(),
            onPressToMakePhoneCall : this.makePhoneCall.bind(this),
            archivable : this.isArchivable(),
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
        if(isUpdated){
            fields.approved = this.isApprovable()? {
                text : 'Approuvé',
                type : 'switch',
                defaultValue : 0,
                checkedTooltip: 'Oui',
                disabled : Auth.isTableDataAllowed({table:tableName,action:'updateapproved'})? false:true,
                uncheckedTooltip : 'Non'
            } : null;
        }
        rActionsArg.contentProps = Object.assign({},customContentProps);
        rActionsArg.containerProps = Object.assign({},customContainerProps);
        formProps.onKeyEvent = this.onKeyEvent.bind(this);
        rActionsArg.elevation = typeof rActionsArg.contentProps.elevation ==="number"? contentProps.elevation : typeof elevation == 'number' ? elevation : 5;
        rActionsArg.formProps = formProps;
        return rActionsArg;
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
    componentWillRender(rActionsArg){
        rActionsArg.context = this;
        const rActions = renderActions.call(this,rActionsArg);
        const renderedActs = this.renderActions(rActionsArg);
        if(!rActionsArg.archived){
            const customActionKeyPrefix = this.getRenderedActionPrefix();
            const iPrefix = customActionKeyPrefix === false ? "" : defaultStr(customActionKeyPrefix,"zact")
            Object.map(renderedActs,(a,i)=>{
                rActions[iPrefix+i] = a;
            });
        }
        rActionsArg.actions = rActions;
        return rActionsArg;
    }
    _render ({header,content,context}){
        const restProps = this.getCurrentEditingProps();
        delete restProps.tabs;
        let {tabProps,firstTabProps,tabsProps,withScrollView} = restProps;
        let testID = this.testIDProp;
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
        const isMobile = isMobileOrTabletMedia();
        const contentProps = restProps.contentProps;
        const elevation = restProps.elevation;
        const renderingTabsProps = {tabs,data:this.getCurrentData(),isMobile,sessionName:this.INITIAL_STATE.sessionName,props:restProps,tabProps,tabsProps,context,tabKey};
        const hasTabs = Object.size(tabs,true);
        let mainContent = undefined;
        testID = defaultStr(testID,"RN_TableDataScreenItem_"+restProps.tableName);
        const isMobOrTab = isMobileOrTabletMedia();
        firstTabProps = extendObj({},tabProps,firstTabProps);
        if(hasTabs){
            if(isMobOrTab){
                renderingTabsProps.firstTab = <Tab.Item testID={testID+"_MainTab"} label={"Principal"} {...firstTabProps} key={tabKey}>
                    <Surface testID={testID+"_MainTab_Content"} elevation={5} {...contentProps} style={[styles.noMarging,contentProps.style,styles.h100,styles.noPadding]}>
                        {header}
                        {content}
                    </Surface>
                </Tab.Item>
            } else {
                //tabsProps.tabItemsProps.elevation = 0;
            }
            const ct = renderTabsContent(renderingTabsProps);
            if(isMobOrTab && ct){
                contentProps.style = [contentProps.style,styles.noMarging,styles.noPadding,styles.content]
                mainContent = ct;
            } else {
                mainContent = <View  {...contentProps} testID={testID+"_ContentContainer"} style={[styles.container,styles.noPadding]}>
                    <ScrollView virtualized testID={testID+"_MainContentScrollView"} contentProps={{style:theme.styles.p1}}>
                        <Surface elevation={elevation} testID={testID+"_ContentHeader"} style={[styles.screenContent,theme.styles.p1,header?styles.screenContentWithHeader:null]}>
                            {header}
                            {content}
                        </Surface>
                        {ct ? <Surface {...contentProps} testID={testID+"_DesktopContentTabs"} elevation={elevation} style={[contentProps.style]}>
                            {ct}
                        </Surface> : null}
                    </ScrollView>
                </View>
            }
        } else {
            mainContent = <Surface  {...contentProps} testID={testID+"_MainContentContainer"} elevation={elevation} style={[styles.container,styles.noPadding,{paddingTop:0,marginTop:0}]}>
                <ScrollView virtualized testID={testID+"_MainContentScrollViewWithoutTab"}>
                    <View testID={testID+"_MainContent"} style={[styles.screenContent,!isMobOrTab && theme.styles.p1,header?styles.screenContentWithHeader:null]}>
                        {header}
                        {content}
                    </View>
                </ScrollView>
            </Surface>
        }
        const appBarProps = this.getAppBarActionsProps(restProps);
        if(hasTabs && isMobOrTab){
            appBarProps.elevation = 0;
            restProps.elevation = 0;
        }
        return <ScreenContainer {...restProps} appBarProps = {appBarProps} testID={testID}>
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
        return false;
    }
    isArchived(data){
        data = defaultObj(data,this.state.data);
        return this.isArchivable() && this.isDocEditing(data) && (!!data.archived || !!data.wasTransferred)? true : !!this.INITIAL_STATE.archived || false;
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
        return this.isDocEditing(data)? data : this.getCurrentData();
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
        return false;
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
        if(!this.isDocEditingProp){
            if(isDocEditing(data,this.primaryKeyFields,({index:field,data})=>{
                return checkPrimary(data,field);
            })) return true;
        }
        return super.isDocEditing(data);
    }
    print(data){   
        if(!this.isPrintable() && typeof this.printProp!=='function') return;
        data = this.isDocEditing(data)? data : isObj(data) && this.isDocEditing(data.data)? data.data : {};
        return this.printProp(data,this);
    }
    isClonable(){
        return true;
    }
    clone (data){
        if(!this._isMounted() || !this.isClonable())return data;
        data = {...this.getCurrentEditingData(data)};
        if(this.cloneProp && this.cloneProp(data,this) === false) return data;
        this.showPreloader();
        delete data.approved;
        Object.map(['_rev',...generatedColumnsProperties,...Object.keys(this.primaryKeyFields),'_id','code','updateBy','updatedDate','createBy','updatedHour','createdHour','createdDate'],(idx)=>{
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
        if(stableHash({data,datas}) != stableHash({data:this.state.data,datas:this.state.datas})){
            this.setState(this.prepareStateData(nextProps));
        }
        return;
    }
    reset (args,cb){
        if(!this._isMounted()) return;
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
        if(typeof this.upsertDataToDB ==='function'){
            return this.upsertDataToDB(args);
        }
        return Promise.resolve({});
    }
    getDataProp(){
        return Object.assign({},this.getCurrentData());
    }
    getAppBarActionsProps(props){
        return {...super.getAppBarActionsProps(props),data:this.getCurrentData()}
    }
    /**** cette fonction est appelée immédiatement lorsque l'on clique sur le bouton enregistrer de l'un des actions du formulaire */
    onPressToSaveFormData(args){
        return this.doSave(args);
    }
    canCreateNew(){
        return this.newActionProp !== false ? true : false;
    }
    createNew(){
        return this.reset();
    }
    archive(){}
    validateData(args){
        if(typeof this.validateDataBeforeSave =='function'){
            return this.validateDataBeforeSave(args);
        }
        return true;
    }
    onSaveTableData(){}
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
                    let savedData = this.isDocEditing(upserted)? upserted : data;
                    const newArgs = {tableName,actionName:action,action,table:this.table,data:savedData,result:upserted,context};
                    APP.trigger(cActions.upsert(tableName),newArgs);
                    if(this.onSaveTableData(newArgs) === false || (isFunction(this.onSaveProp)&& this.onSaveProp(newArgs) === false)){
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
                        closePreloader();
                    } else if(action === 'save'){
                        this.reset({data:savedData});
                        closePreloader();
                    } else if(willCloseAfterSave) {
                        close();
                    } else {
                        notify('Données modifiée avec succès!!','success');
                        closePreloader();
                    }
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
    getMakePhoneCallProps (){
        const table = this.table;
        const makePhoneCallProps = defaultVal(this.makePhoneCallProps,table.makePhoneCallProps);
        return defaultObj(typeof makePhoneCallProps === 'function' ? makePhoneCallProps(this.getCurrentData()) : makePhoneCallProps);
    }
    makePhoneCall(data){
        if(!this.canMakePhoneCall() || !canMakePhoneCall()) return false;
        makePCall(defaultObj(data || this.getCurrentData()),this.getMakePhoneCallProps());
        return false;
    }
   
    /*** archivedPermsFilter est la fonction permettant de filtres les permissions qui par défaut ne figurent pas parmis les permissions en readOnly
     * si archivedPermFilter retourne true pour une permission données alors cette permission sera ignorée
    */
    archivedPermsFilter (perm,perms){
        return true;
    };
    copyToClipboard(){
        return copyToClipboard({
            data : this.getCurrentData(),
            fields : this.INITIAL_STATE.fields,
            sessionName : this.INITIAL_STATE.sessionName,
        })
    }
    renderDatagridActions(args){
        args = defaultObj(args);
        let {datagrid,filterAction} = args
        let ret = [];
        if(this.isDocEditing(args.data) && isObj(datagrid) && typeof (datagrid.selectedRowsActions) ==='function'){
            filterAction = defaultFunc(filterAction,(x)=>true);
            Object.map(datagrid.selectedRowsActions({selectedRows : {[args.data._id]:args.data},Auth}),(v,i)=>{
                if(isObj(v) && filterAction(v,i)){
                    ret.push({...v},i);
                }
            })  
        }
         return ret;
    }
    getAppBarTitle (){
        return defaultStr(this.titleProp,this.table.text,this.table.label);
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
    prepareField : PropTypes.func,//La fonction permettant de faire des mutations sur le champ field à passer au formulaire form. si elle retourne false alors la field ne sera pas pris een compte
    table : PropTypes.shape({
        tableName : PropTypes.string,
        table : PropTypes.string,
        fields : PropTypes.object,
    }),
    unique : PropTypes.bool,//si la validation de type unique sur le champ sera effective
    fetchUniqueId : PropTypes.func,//la fonction permettant de fetch un élément unique pour la validation de type uniqueID, liée aux champs de type piece et id
    validateData : PropTypes.func,// la fonction permettant de valider les données à enregistrer
    archivedPermsFilter : PropTypes.func,///le filtre des permissions archivées
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
    noMarging : {
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