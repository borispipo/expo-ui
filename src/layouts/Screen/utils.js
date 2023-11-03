import Tab from "$ecomponents/Tab";
import {isObjOrArray,defaultStr,defaultObj,isNonNullString,defaultArray,defaultFunc} from "$cutils";
import React from "$react";
import {Colors} from "$theme";
import { COPY_ICON,PRINT_ICON} from "$ecomponents/Icon";
import {getTableDataRouteName} from "$enavigation/utils";

//@seee : https://github.com/typeorm/typeorm/blob/master/src/entity-schema/EntitySchemaColumnOptions.ts
export const generatedColumnsProperties = ["createDate","updateDate","deleteDate","createBy","updateBy","deleteBy"]

export const renderTabsContent = ({tabs,context,data,sessionName,isMobile,props,firstTab,tabKey,tabProps,tabsProps})=>{
    let tabsArr = [],hasFirstTab = false; 
    if(React.isValidElement(firstTab)){
        tabsArr.push(firstTab);
        hasFirstTab = true;
    }
    tabsProps = Object.clone(tabsProps);
    tabsProps.centered = false;
    tabKey = typeof tabKey =='string' || typeof tabKey =='number'? tabKey : 'first-tab-key';
    let idx = tabsArr.length-1;
    const testID = defaultStr(tabsProps.testID,"RN_TableDataScreenTab");
    if(isObjOrArray(tabs) && Object.size(tabs,true)>0){
        Object.map(tabs,(tab,index,i)=>{
            if(!isObj(tab)) return null;
            let key = index+(tabKey),label = null,children = null;
            idx++;
            const tabP = Object.assign({},tabProps);
            tabP.index = idx;
            if(React.isValidElement(tab)){
                children = tab;
            } else {
                let {text,render,...rest} = tab;
                extendObj(tabP,rest);
                label = defaultVal(tab.label,text)
                children = tab.children;
                delete tab.children;
                tabP.label = label;
                key = (key+defaultStr(tab.key,tab._id)).replaceAll(" ",);
                if(typeof (render) =='function'){
                    children = render.call(context,{context,sessionName,isMobile,data,index,tab,props,key});
                } else if(!React.isValidElement(children) && React.isValidElement(render)){
                    children = render;
                }
            }
            if(React.isValidElement(children)){
                tabsArr.push(
                    <Tab.Item testID={testID+"_Item_"+key} label={label} {...tabP} style={[{paddingBottom:50},tabP.style]} key={key}>
                        {children}
                    </Tab.Item> 
                )
            }
        })
    }
    if(tabsArr.length> (hasFirstTab ? 1 : 0)){
        return <Tab testID={testID}
             {...tabsProps} 
            onChange={(args)=>{
                if(typeof tabsProps.onChange =='function'){
                    tabsProps.onChange(args)
                }
                context.activeTabIndex = args.activeIndex;
            }} 
            sessionName = {sessionName}
            activeIndex = {typeof context.activeTabIndex =='number'? context.activeTabIndex : tabsProps.activeIndex}
        >
            {tabsArr}
        </Tab>
    }
    return null;
}
export const readablePerms = ["read","print"];
export const defaultArchivedPermsFilter = ({perm})=>!readablePerms.includes(perm) && !readablePerms.includes(perm.toLowerCase());
export  function renderActions({context,isUpdate,newElementLabel,readablePerms:cReadablePerms,makePhoneCallProps,hasManyData,onPressCopyToClipboard,archived,archivedPermsFilter,canMakePhoneCall,onPressToMakePhoneCall,saveAction,save2newAction,save2cloneAction,save2closeAction,cloneAction,readOnly,printable,archivable,data,table,perm,tableName,saveButton,datas,rows,currentData,currentDataIndex,onPressToSave,onPressToCreateNew,onPressToPrint,onPressToPrevious,onPressToNext,onPressToArchive,...rest}){
    let textSave = defaultStr(saveButton)
    table = defaultStr(tableName,table);
    datas = defaultArray(datas,rows);
    const self = context || {}
    let action = ['create','approve','updateapproved','update','delete','print','archive'];
    const getActionsPerms = isFunction(self.getActionsPerms) ? self.getActionsPerms.bind(self) : undefined;
    let perms = {};
    readOnly = defaultBool(readOnly,false);
    const callArgs = {readOnly,perm,archived,isUpdate,currentData,action,data,tableName:table,table,context,datas};
    if(getActionsPerms){
        /**** getAction perms est la fonction appelée parl'objet TableData, pour retourner les permission des actions de la tableData */
        perms = getActionsPerms.call(self,callArgs)
    } else {
        perms = (isNonNullString(perm)? Auth.isAllowed({resource:perm.split(':')[0],action}):Auth.isTableDataAllowed({table,action}));
    }
    if(!printable){
        delete perms.print;
        delete perms.printable;
    }
    if(!archivable){
        delete perms.archive;
        delete perms.archivable;
    }
    if(archived){     
        archivedPermsFilter = defaultFunc(archivedPermsFilter,defaultArchivedPermsFilter);
        Object.map(perms,(p,perm)=>{
            if(archivedPermsFilter({perm,perms,data,tableName,readOnly,currentData,context,tableName,isUpdate})) delete perms[i];
        });
    }
    rest = defaultObj(rest);
    newElementLabel = defaultStr(newElementLabel,"Nouveau");
    let permsObj = checkPermsActions.call(self,{...defaultObj(perms),isUpdate})
    makePhoneCallProps = typeof makePhoneCallProps ==='function'? makePhoneCallProps({data,rowData:data,context:{},isTableDataActions:true,table,tableName:table}): makePhoneCallProps;
    self.permsObj = permsObj;
    if(makePhoneCallProps !== false){
        makePhoneCallProps = defaultObj(makePhoneCallProps);
    }
    let save = (!readOnly && !permsObj.canSave || (saveAction === false))? null: {
        text :hasManyData? 'Modifier': textSave,
        title :hasManyData? 'Modifier': textSave,
        isAction : true,
        shortcut : 'save',
        flat : true,
        icon : 'content-save',
        color: Colors.get('green500'),
        onPress : createCallback({context:self,action:'save',callback:onPressToSave})
    }, save2close = (readOnly || save2closeAction === false || (!permsObj.canSave) || (hasManyData && datas.length !== 1))?null:{
        text : textSave+'+ Fermer',
        title : textSave+'+ Fermer',
        isAction : true,
        shortcut : "save2close",
        icon : 'content-save-all-outline',
        flat : true,
        onPress : createCallback({context:self,action:'save2close',callback:onPressToSave})
    }, save2new = (save2newAction !== false && !readOnly && permsObj.canSave2New && !hasManyData)?{
        text : textSave+'& '+newElementLabel,
        title : textSave+'& '+newElementLabel,
        isAction : true,
        shortcut : "save2new",
        icon : 'content-save-edit',
        flat : true,
        onPress : createCallback({context:self,action:'save2new',callback:onPressToSave})
    } : null
    ,save2clone = (save2cloneAction !== false && cloneAction !== false && !readOnly && save && permsObj.canCreate)?{
        text : textSave+'& Dupliquer',
        title : textSave+'& Dupliquer',
        isAction : true,
        shortcut : "save2clone",
        icon : 'content-save-move',
        flat : true,
        onPress : createCallback({context:self,action:'save2clone',callback:onPressToSave})
    } : null;
    
    return {
        print : (isUpdate && permsObj.canPrint)?{
            text : 'Imprimer',
            shortcut : 'print',
            isAction : false,
            icon : PRINT_ICON,
            flat : true,
            handleChange : false,
            onPress : createCallback({context:self,action:'print',callback:onPressToPrint})
        }:null,
        save2print : (save || save2close) && permsObj.canPrint ? {
            icon : 'printer-check',
            text : 'Enregistrer + imprimer',
            shortcut : 'save2print',
            isAction : true,
            flat : true,
            title : 'Enregistrer, fermer puis imprimer',
            onPress:  createCallback({context:self,action:'save2print',callback:onPressToSave})
        } : null,
        save2close,
        save2new,
        save2clone,
        save,
        previous : (hasManyData && datas.length > 0 && currentDataIndex > 0)?{
            icon : 'chevron-left',
            text : 'Précédent',
            shortcut : 'previous',
            isAction : false,
            flat : true,
            title : 'Précédent',
            onPress:onPressToPrevious
        }:null,
        next : (hasManyData && datas.length-1 > currentDataIndex)? {
            icon : 'chevron-right',
            text : 'Suivant',
            shortcut : 'next',
            title : 'Suivant',
            flat : true,
            isAction:false,
            onPress :onPressToNext
        } : null,
        clone : (cloneAction !== false && !readOnly && isUpdate && permsObj.canCreate)?{
            text : 'Dupliquer',
            isAction : true,
            shortcut : 'clone',
            icon : 'content-duplicate',
            flat : true,
            onPress: createCallback({context:self,action:'clone',callback:onPressToSave})
        } : null,
        archive : (isUpdate && !archived && permsObj.canArchive) ?{
            text : 'Archiver',
            isAction : false,
            shortcut : 'archive',
            icon : 'archive',
            handleChange : false,
            flat : true,
            onPress: createCallback({context:self,action:'archive',callback:onPressToArchive||onPressToSave})
        } : null,
        new : isUpdate && (save2new || (perms.create && save2newAction !== false)) ? {
            text : newElementLabel,
            title : newElementLabel,
            isAction : false,
            shortcut : "new",
            icon : 'new-box',
            flat : true,
            onPress : createCallback({context:self,action:'new',callback:onPressToCreateNew})
        } : null,
        makePhoneCall : (canMakePhoneCall && isUpdate && isObj(makePhoneCallProps))?{
            text : defaultStr(makePhoneCallProps.text,makePhoneCallProps.label,'Appeler'),
            isAction : true,
            icon : defaultStr(makePhoneCallProps.icon,'phone'),
            handleChange : false,
            flat : true,
            onPress : createCallback({context:self,action:'makePhoneCall',force:true,callback:onPressToMakePhoneCall})
        }:null,
        copyToClipboard : (false && isUpdate)?{
            text : 'Copier',
            icon : COPY_ICON,
            title : 'Copier',
            flat : true,
            isAction : false,
            onPress: createCallback({context:self,action:'copyToClipboard',callback:onPressCopyToClipboard})
        } : null,
    }
}




/*** vérifie les actions qu'à un utilisateur en fonction de ses permission en lecture, en écriture
 *  @param arg {object} : L'objet spécifiant les actions par défaut de l'utilisateur
 *  c'est objet est un objet de booléen de la forme : 
 *          isDocUpdate : s'il d'ajit d'une mise à jour du document
 *          read : si l'utilisateur a accès en lecture
 *          write || create : si l'utilisateur a accès en écriture
 *          edit || update : si l'utilisateur a accès en modification
 *          remove || delete : si l'utilisateur peut supprimer
 *          print || printable : si l'utilisateur peut imprimer le document
 * 
 *  @return {object} retourne un objet de la forme : 
 *      canSave : Si l'utilisateur peut enregistrer un élément
 *      canUpdate : si l'utilisateur peut modifier la resource
 *      canDelete : si l'utilisateur peut supprimer la resource,
 *      canSave2New : Si l'utilisateur peut enregistrer et créer un nouvel element
 *      canSave2Close : si l'utilisateur peut enregistrer et fermer,
 *      canPrint : si l'utilisateur peut imprimer la table data où pas
 */
 export const checkPermsActions = function (arg){
    arg = defaultObj(arg);
    let {isUpdate,print,printable,create,write,archive,archivable,read,remove,update,edit} = arg;
    let canUpdate = isUpdate && defaultBool(update,edit,false);
    let canCreate =  defaultBool(create,write,false);
    let canSave = ((canCreate && !isUpdate) || canUpdate );
    let canDelete = defaultBool(remove,arg.delete,false)
    let canPrint = defaultBool(print,printable,false);
    let canArchive = defaultBool(archive,archivable,false)
    return {
        canArchive,
        canPrint,
        canSave,
        canCreate,
        canSave2Close:canSave,
        canSave2New : canSave && canCreate,
        canDelete,
        canRemove : canDelete,
    }
}

export const createCallback  = ({context,action,callback,force}) =>{
    if(force === true && isFunction(callback)) return callback;
    return (a1,a2,a3,a4) =>{
        context = context || {};
        if(action && typeof action == "string"){
            context.clickedEl = action;
        }
        if(isFunction(callback)) callback.call(context,a1,a2,a3,a4);
        return true;
    }
}

export const getScreenName = (screenName)=>{
    if(isObj(screenName)){
        screenName = defaultStr(screenName.table,screenName.tableName);
    }
    return getTableDataRouteName(screenName);
}

