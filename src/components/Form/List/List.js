import Button from "$components/Button";
import {showConfirm,notify} from "$components/Dialog";
import Avatar from "$components/Avatar";
import Icon from "$components/Icon";
import Datagrid from "$components/Datagrid";
import PropTypes from "prop-types";
import React,{Component as AppComponent} from "$react";
import {isNonNullString,defaultStr,defaultObj,defaultArray,extendObj,isObjOrArray,isFunction,isStringNumber} from "$utils";
import {isPhoneMedia} from "$platform/dimensions";
import View from "$components/View";
import {StyleSheet} from "react-native";
import {List} from "react-native-paper";
import FlashList from "$components/List";
import Surface from "$components/Surface";
import {navigate} from "$navigation/utils";
import { handleBeforeSaveCallback } from "$components/Form/FormData/utils";
import theme from "$theme";

const NoDefinedIndexMssage = "Valeur non définie de l'indice pour l'enregistrement de la FormList";

export default class FormListComponent extends AppComponent {
    constructor(props){
        super(props)
        this.autobind();
        this.formName = isNonNullString(this.props.formName)?this.props.formName : uniqid("form-list-form");
        this.displayTypes = Object.toArray(this.props.displayTypes);
        if(this.displayTypes.length <=0){
            this.displayTypes = ['list'];
        }
        const isHandlingObject = FormListComponent.isHandlingObject(props);
        Object.defineProperties(this,{
            dialogProviderRef : {
                value : React.createRef(null),
            },
            isListControlled : {
                value : typeof this.props.controlled === 'boolean'? this.props.controlled : true,
                override : false,
            },
            isHandlingObject : {
                value : isHandlingObject, override: false, writable : false,
            },
            push : {
                value : isHandlingObject ?  ({data,index,allData})=>{
                    allData[index] = data;
                } :  ({data,index,allData})=>{
                    allData.push(data);
                },override : false,
            }
        })
        if(this.isListControlled){
            this.state.allData = this.getAllData(false);
        }
        this.canChangeDisplayType = isArray(this.displayTypes) && arrayValueExists(this.displayTypes,'list') && arrayValueExists(this.displayTypes,'table');
        this.state.display = this.props.display;
    }
    getEmptyAllData(){
        return this.isHandlingObject ? {}: [];
    }
    getAllData(initialized){
        if(this.isListControlled && initialized !== false){
            return this.state.allData;
        }
        let {allData} = this.props;
        if(this.isHandlingObject){
            return isObj(allData) ? allData : {};
        }
        return Array.isArray(allData)? allData : []
    }
    getDestructiveAllData(){
        const allData = this.getAllData();
        return Array.isArray(allData)? [...allData] : {...allData};
    }
    setAllData(allData,cb){
        if(this.isListControlled){
            return this.setState({allData},cb);
        }
        if(typeof cb =='function'){
            cb(allData);
        }
    }
    /*** retourne l'indice de la données à partir de la valeur data */
    getIndex ({data,index,indexField,context,allData}){
        context = context || this.props.context || this;
        if(!indexField){
            indexField =  this.props.indexField;
        }
        if(!allData){
            allData = this.getAllData();
        }
        if(this.isHandlingObject){
            allData = defaultObj(allData)
        } else allData = defaultArray(allData);
        if(isFunction(indexField)){
            index = indexField.call(context,{context,data,index,allData});
        } else if(isNonNullString(indexField) && isObj(data) && data.hasOwnProperty(indexField)){
            index = data[indexField];
        } 
        const errorMessage = "Valeur de l'indice de la FormList non valide!! la fonction ou le champ index doit être une valeur entière ou une chaine de caractère";
        if(this.isHandlingObject){
            if(!isNonNullString(index) && !isNumber(index)){
                console.error(errorMessage,index,this.props)
                return undefined;
            }
            return index;
        } 
        if(isStringNumber(index)){
            index = parseInt(index) || undefined;
        }
        if(!isNumber(index) || Object.size(allData,true)<=0){
            index = Object.size(allData);
        }
        if(!isNumber(index)){
            console.error(errorMessage,index,this.props);
            return undefined;
        }
        return index;
    }

    _delete (data,index,primaryText){
        let {beforeRemove} = this.props;
        if(typeof beforeRemove !=='function' && isObj(this.props.formDataProps)){
            beforeRemove = typeof this.props.formDataProps.beforeRemove =='function'? this.formDataProps.beforeRemove : undefined;
        }
        let context = this.props.context || this;
        let canR = undefined;
        const doDelete = ()=>{
            let allData = this.getEmptyAllData();
            let sAllData = this.getAllData();
            const removingIndex = this.getIndex({data,allData:sAllData,context:this});
            if((typeof removingIndex !== 'string' && typeof removingIndex !=='number') || !sAllData[removingIndex]){
                console.error("unable to remove data from form List with index ",removingIndex,index," for data ",data," and all data is ",sAllData);
                return notify.error("Impossible de supprimer la ligne sélectionnée car l'index "+removingIndex+", est invalide");
            }
            const toRemove = sAllData[removingIndex] || data;
            Object.map(sAllData,(data,i)=>{
                if(!isObj(data) || i === index || toRemove === data) return;
                allData[i] = data;
            })
            this.setAllData(allData,()=>{
                let context = this.props.context || this;
                if(isFunction(this.props.onRemove)){
                    this.props.onRemove.call(context,{context,props:this.props,primaryText,data:toRemove,deleted:toRemove,removed:toRemove,index,allData});
                } else if(isFunction(this.props.onDelete)){
                    this.props.onDelete.call(context,{context,props:this.props,primaryText,data:toRemove,deleted:toRemove,removed:toRemove,index,allData});
                }
            })
        }
        if(isFunction(beforeRemove)){
            canR = beforeRemove.call(context,{context,action:'remove',removing:true,primaryText,data,index,allData:this.props.allData});
            if(isNonNullString(canR)){
                notify.error(canR);
                return;
            }
            if(canR === false) return;
            if(isPromise(canR)){
                canR.then((r)=>{
                    if(r === false) {
                        return;
                    }
                    if(isNonNullString(r)){
                        notify.error(r);
                        return;
                    }
                    doDelete();
                }).catch((e)=>{
                    if(isNonNullString(e) || isObj(e)){
                        notify.error(e);
                    }
                    return;
                })
                return false;
            }
        }
        doDelete();
    }
    delete (data,index,primaryText){
        if(defaultVal(this.props.confirmOnDelete,true)){
            showConfirm({
                title : ("Suppr : "+(isNonNullString(primaryText)?primaryText:"l'élément")),
                message : "Voulez vous vraiment supprimer l'élément sélectionné?",
                onSuccess :()=>{
                    this._delete(data,index,primaryText)
                }
            })
        } else {
            this._delete(data,index,primaryText)
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if(this.isListControlled){
            let {allData} = nextProps;
            if(this.isHandlingObject){
                allData = isObj(allData) ? allData : {};
            } else allData = Array.isArray(allData)? allData : []
            this.setState({allData});
        }
    }
    componentDidUpdate(){
        super.componentDidUpdate();
    }
    refresh(){
        if(this.datagridRef && this.datagridRef.refresh){
            this.datagridRef.refresh(true);
        }
    }
    onSave (arg){
        const {data,currentIndex,isEditing} = arg;
        const allData = this.getEmptyAllData();
        const sAllData = this.getAllData();
        let isDefault = isObj(data) && data.isDefault;
        let index = isEditing? this.getIndex({data,allData:sAllData,context:this}) : currentIndex;
        Object.map(sAllData,(d,index)=>{
            if(!isObj(d)) return;
            if(isDefault && data !== d){
                d.isDefault = 0;
            }
            if(!this.isHandlingObject){    
                allData.push(d);
            } else if(index === this.getIndex({data:d,index,context:this,allData:this.props.allData})){
                allData[index] = d;
            } 
        })
        if(this.isHandlingObject){
            index = this.getIndex({data,index,context:this,allData:this.props.allData});
            if(index === undefined) {
                //notify.error(NoDefinedIndexMssage,data,this.props.indexField)
                return NoDefinedIndexMssage;
            }
            allData[index] = data;
        } else {
            if(!isEditing){
                allData.push(data)
                index = allData.length-1;
            } else {
                if(typeof index =='number'){
                    allData[index] = data; 
                }
            }
        }
        return new Promise((resolve,reject)=>{
            arg.allData = allData;
            const befSave = defaultFunc(this.props.beforeSave,isObj(this.props.formDataProps)?this.props.formDataProps.beforeSave : undefined);
            return handleBeforeSaveCallback(befSave,()=>{
                return handleBeforeSaveCallback(this.props.onSave,()=>{
                    this.setAllData(allData,()=>{
                        resolve(arg)
                    })
                },arg);
            },arg); 
        })   
        
    }  
    getNavigationParams({data,index,context}){
        let {
            fields,
            actions,
            deletable,
            renderAvatar,
            routeName,
            primaryText,
            show,
            text,
            title,
            indexField,
            editable,addIcon,
            addIconLabel,
            onRemove,onSave,
            onDelete,
            beforeSave,
            beforeRemove,
            itemProps,
            avatarProps,
            secondaryText,
            appBarProps,
            formName,
            content,
            formDataProps,
            datagridProps,
            allData,
            upsertProps,
            upsertEltProps,
            newElementLabel,
            parentData,
            ...rest
        } = this.props;
        rest = defaultObj(rest);
        data = defaultObj(data);
        upsertEltProps = defaultVal(upsertEltProps,upsertProps);
        let params = {
            routeName,
            parentData,
            onSave : this.onSave.bind(this),
            title,
            newElementLabel,
            indexField,
            allData : this.state.allData,
            show : this.show.bind(this),
            currentIndex : index,
            title : defaultStr(title,text),
            //formDataProps,
            formName,
            //fields,
            data,
        }
        if(typeof upsertEltProps =='function'){
            params = {...params,...defaultObj(upsertEltProps(params)),allData:this.state.allData,onSave : this.onSave.bind(this),show : this.show.bind(this),currentIndex : index,routeName,data:params.data,indexField}
        } else {
            params = {...params,...defaultObj(upsertEltProps),allData:this.state.allData,onSave : this.onSave.bind(this),show : this.show.bind(this),currentIndex : index,routeName,data,indexField};
        }
        return params;
    }
    show (args){
        const params = this.getNavigationParams(args);
        return navigate(params,this.props.navigation)
    }
    /*** si l'affichage peut être sur forme de datagrid */
    canRenderDatagrid(_fields){
        let {datagridProps,fields} = this.props;
        fields = isObjOrArray(_fields)? _fields:fields;
        if(!isObjOrArray(fields)) return false;
        let hasF = false;
        for(let i in fields){
            if(isObj(fields[i]) && (fields[i].label || fields[i].type || fields[i].text)){
                hasF = true;
                break;
            }
        }
        return hasF && (datagridProps !== false ? true : false)?true : false;
    }
    changeDisplayType(cb){
        this.setState({display:this.state.display == 'table'? 'list':'table'},cb);
    }
    onRowPress(args){
        if(isFunction(this._onRowsClick)){
            this._onRowsClick(args);
        }
        return;
    }
    datagridSelectedRowsActions(args){
        let allData = this.getAllData();
        let datagridProps = defaultObj(this.props.datagridProps);
        let {selectedRowsActions} = datagridProps;
        let context = this.props.context || this;
        args.context = context;
        args.display = "table";
        if(isFunction(selectedRowsActions)){
            selectedRowsActions = selectedRowsActions(args);
        }
        selectedRowsActions = isObjOrArray(selectedRowsActions)? selectedRowsActions : []
        let editable = defaultVal(datagridProps.editable,this.props.editable);
        let deletable = defaultVal(datagridProps.deletable,this.props.deletable);
        let _sActs = isObj(selectedRowsActions)? {} : [];
        if(editable){
            let _edit = {
                text : isNonNullString(editable)? editable:'Modifier l\'élément',
                icon : 'pencil',
                onPress : (args)=>{
                    let {selectedRows} = args;
                    let keys = Object.keys(selectedRows);
                    let index = keys[0];
                    let data = Object.assign({},selectedRows[index]);
                    let pArgs = {...args,data,index,allData:allData,selectedRows};
                    const canEdit = defaultVal(isFunction(editable)?editable.call(context,pArgs):editable,true)
                    if(canEdit){
                        return this.show(pArgs);
                    }
                }
            }
            if(isObj(_sActs)){
                _sActs.editSingleItem = _edit;
            } else {
                _sActs.push(_edit);
            }
        }
        if(deletable){
            const _delete = {
                text : isNonNullString(deletable)? deletable : 'Suppr l\'élément',
                icon : 'delete',
                onPress : (args)=>{
                    let {selectedRows} = args;
                    let keys = Object.keys(selectedRows);
                    let index = keys[0];
                    let data = {...defaultObj(selectedRows[index])};
                    let pArgs = {...args,data,index,allData:allData,selectedRows};
                    const canDelete = defaultVal(isFunction(deletable)?deletable.call(context,pArgs):deletable,true)
                    const pText = defaultStr(data.label)+(isNonNullString(data.code)?('['+data.code+"]"):'')
                    if(canDelete){
                        return this.delete(data,index,pText);
                    }
                }
            }
            if(isObj(_sActs)){
                _sActs.deleteSingleItem = _delete;
            } else {
                _sActs.push(_delete);
            }
        }
        return isObj(_sActs)? {..._sActs,...selectedRowsActions} : [..._sActs,...selectedRowsActions];
    }
    datagridActions(args){
        let {actions} = defaultObj(this.restDatagridProps);
        args = defaultObj(args);
        args.context = this.props.context || this;
        args.display = "table";
        if(isFunction(actions)){
            actions = actions(args);
        }
        actions = isObjOrArray(actions)? actions : [];
        let _acts = isObj(actions)? {} : [];
        let cDisplayType = {
            text : 'Affichage en Liste',
            icon : 'view_list',
            onPress : this.changeDisplayType.bind(this)
        }
        if((this._addIcon)){
            if(isObj(actions)){
                _acts.addIcon = this._addIcon
            } else {
                _acts.push(this._addIcon);
            }
        }
        if(this.canChangeDisplayType){
            if(isObj(actions)){
                _acts.changeDisplayT = cDisplayType
            } else {
                _acts.push(cDisplayType);
            }
        }
        return isObj(_acts)? {..._acts,...actions} : [..._acts,...actions];
    }
    /*** affiche le rendu, lorsque le type d'affichage choisit est de type table */
    render (){
        let {fields,getRowKey,display,displayTypes,datagridProps,deletable,
            renderAvatar,context,primaryText,show,title,indexField,
            allData : customAllData,
            controlled,
            editable,addIcon,addIconLabel,onRemove,onSave,onDelete,
            beforeSave,beforeRemove,formDataProps,formName,
            itemProps,avatarProps,secondaryText,content,
            itemContainerProps,
            routeName,
            testID,
            save2closeAction,
            saveAction,
            save2NewAction,
            newElementLabel,
            dialogProps,
            ...props
        } = this.props;
        dialogProps = defaultObj(dialogProps);
        testID = defaultStr(testID,"RN_FormListComponent")
        const allData = this.getAllData();
        formDataProps = defaultObj(formDataProps);
        fields = isObjOrArray(fields) ? fields : formDataProps.fields;
        props = defaultObj(props);
        let ListProps = React.setProps(List,props);
        context = context || this;
        props = defaultObj(props);
        avatarProps = {...defaultObj(avatarProps)}
        secondaryText = defaultFunc(secondaryText,x=>null);
        primaryText = defaultFunc(primaryText,x=>null);
        renderAvatar = defaultFunc(renderAvatar,x=>null);
        /*** les props de chaque items de la liste */
        itemProps= {...defaultObj(itemProps)}
        const descriptionNumberOfLines = typeof itemProps.numberOfLines ==='number' && itemProps.numberOfLines ? itemProps.numberOfLines : 3;
        let counter = -1;
        let is_o = this.isHandlingObject;
        let addIconObj = null;
        if(addIcon === false || addIcon === null) addIcon = null;
        else {
            let _addIcon = null;
            let onCHandle = {onPress : (ev)=>{
                React.stopEventPropagation(ev);
                this.show({data:{},props:this.props,index:undefined,context,allData});
            }}
            addIconLabel = defaultVal(addIconLabel,"Ajouter un élément");
            addIcon = defaultVal(addIcon,"plus")
            addIconObj = {...onCHandle,icon:addIcon,text:addIconLabel};
            if(isNonNullString(addIcon)) _addIcon = <Icon name={addIcon} size={40} title={'ajouter un élément'}></Icon>;
            if(!React.isValidElement(addIcon)){
                addIcon = _addIcon;
            }
            addIcon = (this.state.display != 'table') ? <Button  
                left = {addIcon}
                style = {styles.addIconButton}
                {...onCHandle} 
            >{addIconLabel}</Button>  : {
                style : styles.addIconButton,
                ...onCHandle,
                right : addIcon,
                children : addIconLabel,
            }
        }
        this._addIcon = addIconObj;
        
        let canRenderTable =  this.canRenderDatagrid(fields);

        if(typeof editable =='undefined'){
            editable = true;
        }
        if(typeof deletable =='undefined'){
            deletable = true;
        }
        const deletableFunc = typeof deletable =='function'? args => defaultVal(deletable.call(context,args,true)) : x => deletable;
        const editableFunc = typeof editable =='function'? args => defaultVal(deletable.call(context,args),true) : x => editable;
        const isCurrentDisplayTable = canRenderTable && this.state.display === 'table';
        let listContent = null;
        if(isCurrentDisplayTable){
            datagridProps = defaultObj(datagridProps);
            let dgProps = extendObj(true,{},{
                pagin : false,
                filters : false,
            },datagridProps)
            dgProps.progressbar = defaultVal(dgProps.progressbar,<Datagrid.LinesProgressBar/>)
            delete dgProps.deletable;
            delete dgProps.editable;
            let _fields = extendObj(true,{},fields,datagridProps.fields)
            this.restDatagridProps = dgProps;
            this._onRowsClick = dgProps.onRowPress;
            listContent = <Datagrid
                testID = {testID+"_Datagrid"} 
                {...dgProps}
                onRowPress = {this.onRowPress.bind(this)}
                rowKey = {dgProps.rowKey === false || this.props.rowKey === false ? undefined : defaultStr(dgProps.rowKey,this.props.rowKey,dgProps.indexField,this.props.indexField,'_id')}
                getRowKey = {(arg)=>{
                    let {row,rowIndex,...rest} = arg;
                    if(getRowKey){
                        return getRowKey({...arg,context:this,datagridContext:arg.context});
                    }
                    return this.getIndex({...defaultObj(rest),index:rowIndex,data:row,context:this,allData});
                }}
                isFormList
                columns = {_fields}
                ref = {(el)=>{
                    if(el){
                        this.datagridRef = el;
                    }
                }}
                data = {allData}
                actions = {this.datagridActions.bind(this)}
                selectedRowsActions = {this.datagridSelectedRowsActions.bind(this)}
            />
        } else {
            itemContainerProps = defaultObj(itemContainerProps);
            if(!React.isValidElement(addIcon,true)){
                addIcon = isObj(addIcon) ?  <Button {...addIconObj} {...addIcon}/> : null;
            }
            listContent = <View testID={testID+"_List"} {...ListProps}>
                <View testID={testID+"_HeaderContainer"} style={[styles.row]}>
                    {!isCurrentDisplayTable && addIcon ? <List.Subheader>{addIcon}</List.Subheader> : null}
                    {canRenderTable && this.canChangeDisplayType && <List.Subheader >
                        <Button 
                            icon = {"view_column"}
                            title = "Affichage en  Tableau"
                            style = {[{maxWidth:30}]}
                            onPress ={this.changeDisplayType.bind(this)}
                        >
                            {!isPhoneMedia() ? 'Affichage en  ':''}Tableau
                        </Button>    
                    </List.Subheader>}
                </View>
                <View testID={testID+"_ListWrapper"} style={[theme.styles.ph1]}>
                    <FlashList
                        items = {allData}
                        responsive
                        prepareItems = {(items)=>{
                            const itx = [];
                            Object.map(items,(data,index,ct)=>{
                                if(!isObj(data)) return null;
                                const _index = this.getIndex({data,index,allData:items});
                                if(is_o &&  (!isNumber(_index) && !isNonNullString(_index))) return null;
                                counter++;
                                const pArgs = {avatarProps,context,itemProps,data:data,index,allData:allData};
                                const deletable = deletableFunc(pArgs),
                                      editable = editableFunc(pArgs);
                                let avatar = renderAvatar.call(context,pArgs);
                                const avatarProps = Object.assign({},avatarProps);
                                if(isObj(avatar)){
                                    for(let i in avatar){
                                        avatarProps[i] = avatar[i];
                                    }
                                    avatar = defaultStr(avatar.src,avatar.children,avatar.content);
                                }
                                if(isNonNullString(avatar)){
                                    let src = undefined;
                                    if(isValidImageSrc(avatar)){
                                        src = avatar;
                                        avatar = undefined;
                                    }
                                    itemProps.left = (lProps)=>{
                                        return <Avatar suffix={ct} {...avatarProps} src={src}>{avatar}</Avatar>
                                    };
                                }
                                const key = index+counter; 
                                itx.push({
                                    data,
                                    index,
                                    _index,
                                    deletable,
                                    editable,
                                    key,
                                    props : {
                                        ...itemProps,
                                        onPress : typeof itemProps.onPress ==='function'? (e)=>{
                                            itemProps.onPress.call(context,{data:{...data},index,allData,context,event:e},e)
                                        } : undefined
                                    }, 
                                    title : primaryText.call(context,pArgs),
                                    description : defaultVal(secondaryText.call(context,pArgs),''),
                                })
                            });
                            return itx;
                        }}
                        renderItem = {({item})=>{
                            const {data,title,description,key,_index,props,index,editable,deletable} = item;
                            const titleText = React.getTextContent(title);
                            return <View key={key} testID={testID+".Cell"+key} style={[theme.styles.w100]}>
                                <Surface key={key} elevation={5} {...itemContainerProps} style={[styles.itemContainer,itemContainerProps.style]}>
                                    <List.Item
                                        {...props}
                                        titleStyle = {[{color:theme.colors.text},props.titleStyle]}
                                        descriptionNumberOfLines = {descriptionNumberOfLines}
                                        key = {index+counter}
                                        title ={title} 
                                        description={description}
                                        descriptionStyle = {[{color:theme.colors.text},props.descriptionStyle]}
                                        style = {[props.style,styles.item]}
                                        right = {!editable && !deletable?undefined : (rProps)=>{
                                            return <View {...rProps} style={[styles.itemRight]}>
                                                {!editable?null:<Icon title={"Modifier ["+titleText+"]"} name={"pencil"} color={theme.colors.secondary} onPress = {(e)=>{
                                                    React.stopEventPropagation(e);
                                                    this.show({data:{...data},index,_index,allData,context})
                                                }} ></Icon>} 
                                                {!deletable?null:<Icon name="delete" color={theme.colors.error} title={"supprimer l'élément "}  onPress = {(e)=>{
                                                    React.stopEventPropagation(e);
                                                    this.delete({...data},index,title);
                                                }}></Icon>}
                                            </View>
                                        }}
                                    />
                                </Surface>
                            </View>
                        }}
                    />
                </View>
            </View>
        }
        return <View testID={testID+"_Container"}>
            {listContent}
        </View>
    }
}

FormListComponent./** détermine si la FormList manipule un objet des données
*  si faux alors allData est un tableau de données data
*  si vrai alors allData est un objet de données data
*/
isHandlingObject = (props)=>{
   props = defaultObj(props);
   if(props.handleObject === false){
        return false;
   }
   return (isNonNullString(props.indexField)) || isFunction(props.indexField);
}

FormListComponent.NoDefinedIndexMssage = NoDefinedIndexMssage;

FormListComponent.propTypes = {
    upsertEltProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]),///les props supplémentaires exploités pour l'ajout où la modification d'un nouvel élément
    upsertProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]), //alias à la props upsertEltProps
    itemContainerProps : PropTypes.object,//les props à appliquer au container de chaque item
    rowKey : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,//si false la valeur du rowKey n'est pas pris en compte
    ]),
    ///pour récupérer la clé de l'élément de ligne, en affichage en datagrid
    getRowKey : PropTypes.func,
    ///les types d'affichage supportés
    displayTypes : PropTypes.array,
    display : PropTypes.string,
    /*** les props du datagrid */
    datagridProps : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.bool, ///pour désactiver l'affichage en table
    ]),
    /*** les champ du formulaire */
    fields : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object)
    ]),
    /**** l'indice courante de l'élément dans la liste : peut être une fonction ou une chaine de caractère
     *  si c'est une chaine de caractère alors la valeur allData est un objet de données et la dite chaine est le nom de la propriété permetant de retourne l'indice unique de la données courante
     *  Si c'est une fonction alors elle doit retourner l'indique unique pour la données courante data
     *  elle prend en paramètre : param {
     *      context : le contexte de la fonction,
*           data : la données courante,
            index : l'indice passé par défaut,
            allData : l'ensemble des données de la liste
     *  }
    */
    indexField : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    addIcon : PropTypes.oneOfType([
        ///lorsque addIcon vaut false, alors il sera impossible d'ajouter un élément dans la liste
        PropTypes.bool,
        /** le nom l'icone icon à définir comme icon du bouton d'ajout d'un nouvel élement d'ajout d'un nouvel élément */
        PropTypes.element,
        PropTypes.node,
    ]),
    addIconLabel : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]),
    allData : PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.object),
        PropTypes.arrayOf(PropTypes.object)
    ]),
    /*** la fonction appelée, pour afficher la données courante, ou le formulaire de création d'une nouvelle données
     *  @param: 
     *          data : Object : la données courante,
     *          index : l'indice de cette données dans la liste des données allData
     */
    show : PropTypes.func,
    hide : PropTypes.func,
    //les props à attribuer au composant avatar
    avatarProps : PropTypes.object,
        /*** 
     *  La fonction utilisée pour le rendu de l'objet avatar
     *  le libelé de l'avatar à afficher sur chaque élément de la liste
     *  Il s'agit d'une fonction qui prend en paramètre la données puis retourne un noeud qui constituera
     *  le label à attribuer à l'élément de la liste : props leftAvatar
     *  @param : {
     *          context : Le contexte actuel
     *          data : la donnée courante dans l'itération sur l'ensemble des données de allData. 
     *          index : l'indice de l'élemnt courant dans le tableau allData,
     *          allData : l'ensemble des données passé à la FormDataList
     *      exemple renderAvatar(data). cette fonction doit retourner un contenu du composant Avatar de react-md
     */
    renderAvatar : PropTypes.func,
    routeName : PropTypes.string,//.isRequired, //le nom de la route où l'on rediregera l'écran pour la modification ou l'ajout d'un nouvel élément
    avatarSuffix : PropTypes.number,
    /**** les différents props de chaque élément de la liste */
    itemProps : PropTypes.object,
    /*** la fonction appelée pour le rendu du contenu de la liste Item
     *  Elle prend en paramètre : l'indice courante dans la liste des données
     *          - la données courante
     *          - 
     */
    secondaryText : PropTypes.func,
    /*** La fonction appelléee pour la génération du texte primaire à afficher pour la liste
     *   prend en paramète : l'indice courante, la données courante dans la boucle et l'ensemble des 
     *   données de la liste
     */
    primaryText : PropTypes.func,
    ///pour le rendu du contenu de la listItem, 
    //sa peut être un contenu noeu où alors un élément où une chaine de caractère
    onRemove : PropTypes.func,
    onDelete : PropTypes.func,
}

const styles = StyleSheet.create({
    itemRight : {
        flexDirection : 'row',
        justifyContent : 'center'
    },
    row : {
        flexDirection : 'row',
        justifyContent : 'flex-start',
        width : '100%'
    },
    addIconButton : {
        fontSize : 16,
        padding:0,
    },
    itemContainer : {
        paddingVertical : 5,
        paddingLeft : 0,
        paddingRight : 0,
        marginHorizontal : 10,
        marginVertical : 10,
    },
    item : {
        paddingRight : 0,
    }
})