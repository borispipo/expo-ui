/*****
    si la props items est une fonction, alors elle ne doit en aucun cas retourner une promesse, 
    mais surtout un tableau un un objet
*/
import PropTypes from "prop-types";
import View from "$ecomponents/View";
import {Dimensions,Pressable,StyleSheet,Animated,} from "react-native";
import {TouchableRipple} from "react-native-paper";
import Divider from "$ecomponents/Divider";
import React, {Fragment,Component as AppComponent} from "$react";
import theme,{Colors} from "$theme";
import Dialog from "$ecomponents/Dialog";
import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import {isIos} from "$cplatform";
import {defaultVal,defaultStr,defaultObj,defaultBool,defaultFunc,debounce,isNonNullString,compare as NCompare} from "$cutils";
import MenuComponent from "$ecomponents/Menu";
import HelperText from "$ecomponents/HelperText";
import TextField,{flatMode} from "$ecomponents/TextField";
import List,{MIN_HEIGHT,BigList} from "$ecomponents/List";
import Icon,{ICON_SIZE,ICON_OFFSET,MORE_ICON} from "$ecomponents/Icon";
import Label from "$ecomponents/Label";
import { matchOperators,getSearchTimeout,canAutoFocusSearchField} from "./utils";
import { ProgressBar,ActivityIndicator} from 'react-native-paper';
import Menu from "$ecomponents/Menu/Menu";
import Chip from "$ecomponents/Chip";
import {Content as BottomSheet,Menu as BottomSheetMenu,getContentHeight} from "$ecomponents/BottomSheet";
import {isWeb} from "$cplatform";
import Tooltip from "$ecomponents/Tooltip";

const _isIos = isIos();

const MAX_SELECTED_ITEMS = 2;

export const isValidValueKey = valueKey => isNonNullString(valueKey);

class DropdownComponent extends AppComponent {
    constructor(props){
        super(props);
        const {getValueKey,getItemKey,visible,renderItem,multiple,defaultValue,selected,compare,itemValue,getItemValue} = props;
        this.keysRefs = [];
        Object.defineProperties(this,{
            fieldsToSort : {
                value : this.prepareSortableFields(),override : false, writable : false,
            },
            getItemKey : {value : typeof getItemKey =='function' ? getItemKey: (item,index)=>React.key(item,index),override:false,writable:false},
            getValueKey : {
                value : typeof getValueKey =='function'? getValueKey : (value,warn)=>{
                    const backValue = value;
                    if(typeof value ==='boolean' || typeof value =='string' || typeof value =='number'){
                        value = value+"";
                    } else {
                        if(warn === true){
                            console.warn("You must specify key value for value for dropdown component",backValue,props);
                        }
                        if(isObj(value)){
                            value = JSON.stringify(value);
                        }
                    }
                    return isValidValueKey(value)? value : "";
                }
            },
            renderItem : {
                value : typeof renderItem =='function'? renderItem : ({item,index}) =>{
                    if(React.isValidElement(item,true) || isDecimal(item) || typeof item =='boolean') return item;
                    if(isObj(item) ) {
                        const itemLabel = this.props.itemLabel;
                        if(isNonNullString(itemLabel) && item.hasOwnProperty(itemLabel)) return defaultStr(item[itemLabel]);
                        if(isNonNullString(item.label)) return item.label;
                        return defaultStr(item.text,item[index]);
                    }
                    return undefined;
                },override : false, writable : false
            },
            getItemValue : {
                value : typeof itemValue =='function'? itemValue : typeof getItemValue =='function'? getItemValue : ({item,index}) =>{
                    if((isObj(item) && item.hasOwnProperty('code'))){
                        return item.code;
                    }
                    return index;
                }, override : false, writable : false
            },
            canHandleMultiple : {
                value  : !!multiple,
                override : false, writable : false,
            },
            isBigList : {
                value : true,//multiple || this.props.dynamicContent ? true : false,
                override : false,
            },
        });

        extendObj(this.state,this.prepareItems());

        extendObj(this.state,{
            initialized : false,
            filterText : "",
            anchorHeight : undefined,
            isMobileMedia : isMobileOrTabletMedia(),
            layout : {
                height: 0,
                width: 0,
            }, 
            visible : typeof visible ==='boolean'? visible : false,
        })

        this.anchorRef = React.createRef(null);
        this.inputRef = React.createRef(null);
        this.listRef = React.createRef(null);
    }
    updateSelected (nState,force){
        nState = defaultObj(nState);
        //this.countEee = defaultNumber(this.countEee)+1;
        if(!("selectedText" in nState)){
            nState.selectedText = this.getSelectedText(nState.selected,nState.selectedValuesKeys);
        }
        const previousSelected = this.state.selected;
        const prevValueKey = this.getValueKey(previousSelected);
        const prevItem = prevValueKey ? this.state.valuesKeys[prevValueKey] : null;
        return this.setState(nState,()=>{
            ///vérifie s'il y a eu changement call on change par exemple
            let selectedItem = null;
            const valueKey = this.getValueKey(this.state.selected);
            if(this.state.initialized && !force){
                if(!this.canHandleMultiple){
                    if(valueKey && this.state.valuesKeys[valueKey]){
                        selectedItem = this.state.valuesKeys[valueKey].item;
                    }
                    if(this.compare(previousSelected,this.state.selected) && selectedItem && prevItem) {
                        return;
                    }
                } else {
                    if(previousSelected === this.state.selected && previousSelected && prevItem) return;
                    if(previousSelected.length == this.state.selected.length){
                        if(!this.state.selected.length) return;
                        let areEquals = true;
                        for(let i in this.state.selected){
                            let found = false;
                            /*** pour chacune des nouvelles valeurs on vérifie s'il existe dans les précédentes valeurs */
                            for(let j in previousSelected){
                                if(this.compare(previousSelected[j],this.state.selected[i])){
                                    found = true;
                                    break;
                                }
                            }
                            /*** si on a pas trouvé alors les valeurs sont différentes */
                            if(!found){
                                areEquals = false;
                                break;
                            }
                        }
                        if(areEquals) return;
                    }
                }
            }
            if(this.props.onChange){
                this.props.onChange({value:this.state.selected,selectedKey:valueKey,selectedItems : this.getSelectedItems(),selectedItem,item:selectedItem,items:this.state.data});
            }
        },force);
    }
    selectItem ({value,select,valueKey}){
        let selected = this.canHandleMultiple ? [...this.state.selected] : undefined;
        let selectedValuesKeys = {...this.state.selectedValuesKeys};
        if(this.canHandleMultiple){
            if(!select){
                if(valueKey in selectedValuesKeys){
                    const newS = [];
                    delete selectedValuesKeys[valueKey];
                    for(let i in selected){
                        const vKey = this.getValueKey(selected[i]);
                        if(vKey && vKey !== valueKey){
                            newS.push(selected[i]);
                        }
                    }
                    selected = newS;
                }
            } else {
                if(!(valueKey in selectedValuesKeys)){
                    selectedValuesKeys[valueKey] = true;
                    selected.push(value);
                }
            }
        } else {
            selected = select ? value : undefined;
            selectedValuesKeys = {};
            if(select){
                selectedValuesKeys[valueKey] = true;
            } 
        }
        this.willHandleFilter = false;
        let nState = {};
        if(!this.canHandleMultiple){
            nState.visible = false;
        }
        this.updateSelected({...nState,data:!this.isBigList?[...this.state.data]: this.state.data,selected,selectedValuesKeys});
    }
    compare (value,currentValue,avoidNullOrEmpty){
        if(this.getValueKey(value) === this.getValueKey(currentValue)) return true;
        if(typeof this.props.compare =='function'){
            return this.props.compare(value,currentValue,{context:this,items:this.state.data})
        }
        return NCompare(value,currentValue,defaultBool(avoidNullOrEmpty,true));
    }
    getCallArgs ({item,items,index,_index,...rest}) {
        return ({...rest,item,index,_index,counterIndex:_index,index,itemIndex:index,context:this,isDropdown:true,props:this.props,items,selectedColor:this.selectedColor,unselectedColor:theme.colors.text});
    }
    isSelected (currentValue,valueKey,forceCheck,currentSelected){
        if(valueKey && forceCheck !== true){
            return valueKey in this.state.selectedValuesKeys ? true : false;
        }
        if(this.canHandleMultiple) {
            currentSelected = Array.isArray(currentSelected)? currentSelected :  this.state.selected;
            for(let i in currentSelected){
                if(this.compare(currentValue,currentSelected[i])) return true;
            }
            return false;
        } else {
            return this.compare(currentValue,forceCheck?currentSelected:this.state.selected);
        }
    }
    prepareSelected({defaultValue}){
        let s = defaultValue !== undefined ? defaultValue : undefined;
        if(this.canHandleMultiple){
            if(isNonNullString(s)){
                s = s.split(",");//si c'est un tableau, ça doit être séparé de virgule
            } else {
                s = Array.isArray(s)? s : Object.toArray(s);
            }   
            return Array.isArray(s)? s : [];         
        }
        return s;
    }
    getNode({item,key,index,name,_index,callArgs}){
        let content = this.renderItem(callArgs);
        const renderText = this.props.renderText;
        let text = React.getTextContent(typeof renderText ==='function'? renderText(callArgs) : undefined);
        if(content && !text){
            text = React.getTextContent(content);
        } else if(!content || !React.isValidElement(content,true)){
            content = text;
        }
        if(!React.isValidElement(content,true) || !content) {
            if(isWeb() || isObj(item)){
                console.warn(content," is not valid element of dropdown name ",name,content,this.props,callArgs);
            }
            return null;
        }
        return {
            item,
            key,
            index,
            _index,
            text : React.getTextContent(text),
            textContent : React.getTextContent(content),
            content,
        }
    }
    getSelectedText (selectedValues,selectedValuesKeys,valuesKeys){
        let counter = 0,sDText = "";
        selectedValuesKeys = isObj(selectedValuesKeys)? selectedValuesKeys : isObj(this.state.selectedValuesKeys) ? this.state.selectedValuesKeys: {};
        selectedValues = selectedValues !== undefined ? selectedValues : this.state.selected;
        valuesKeys = isObj(valuesKeys) && Object.size(valuesKeys,true)? valuesKeys : isObj(this.state.valuesKeys)? this.state.valuesKeys: {};
        const maxCount = MAX_SELECTED_ITEMS;
        for(let valueKey in selectedValuesKeys){
            if(isObj(valuesKeys[valueKey])){
                const node = valuesKeys[valueKey];
                const text = node.text;
                if(!this.canHandleMultiple){
                    sDText = text;
                } else {
                    
                    counter++;
                    if(counter <= maxCount){
                        sDText+= (sDText?", ":"")+text;
                    }
                }
            }
        }
        if(this.canHandleMultiple && counter > maxCount && sDText){
            sDText+= ", et "+((counter-maxCount).formatNumber()+" de plus")
        }
        return sDText;
    }
    pushSelectedValue(value,selectedStateValue){
        if(this.canHandleMultiple){
            selectedStateValue = Array.isArray(selectedStateValue)?selectedStateValue : [];
            selectedStateValue.push(value);
            return selectedStateValue;
        }
        return value;
    }
    getItemsData(args){
        args = defaultObj(args);
        const itDatata = args.items ? args.items : this.props.items;
        const itemsData = typeof itDatata =='function'? itDatata(this.props) : itDatata;
        return itemsData;
    }
    prepareItems (args){
        args = defaultObj(args);
        const nodes = {};
        const data = [];
        const keys = [];
        const valuesKeys = {};
        const {filter} = this.props;
        const currentSelected = this.prepareSelected({defaultValue:this.props.defaultValue,...args});
        let selected = this.canHandleMultiple ? []:undefined,selectedValuesKeys={};
        const itemProps = defaultObj(this.props.itemProps);
        const itemsData = this.getItemsData(args);
        Object.map(itemsData,(item,index,_index)=>{
            const key = this.getItemKey(item,index);
            const callArgs = this.getCallArgs({item,items:itemsData,index,_index});
            const node = this.getNode({item,key,itemProps,index,_index,callArgs})
            if(!node) {
                return null;
            }
            node.value = this.getItemValue(callArgs);
            const valueKey = this.getValueKey(node.value);
            if(!valueKey) {
                return null;
            }
            nodes[key] = node;
            node.valueKey = valueKey;
            valuesKeys[valueKey] = node; 
            if(filter && filter({...callArgs,...nodes[key]}) === false){
                return null;
            }
            if(typeof index =='number'){
                _index = index;
            }
            if(this.isSelected(node.value,valueKey,true,currentSelected)){
                selected = this.pushSelectedValue(node.value,selected);
                selectedValuesKeys[valueKey] = true;
            } else {
                delete selectedValuesKeys[valueKey];
            }
            data.push(item);
            keys.push(key);
        });
        return ({selected,selectedValuesKeys,currentSelected,selectedText:this.getSelectedText(selected,selectedValuesKeys,valuesKeys),valuesKeys,nodes,valuesKeys,data,keys,initialized:true});
    }
    getDefaultValue(){
        return this.state.currentSelected;
    }
    getNodeFromValue (value){
        const vKey= this.getValueKey(value);
        if(!vKey || !isObj(this.state.valuesKeys[vKey])){
            return {};
        }
        return {valueKey:vKey,node:this.state.valuesKeys[vKey]};
    }
    /**** selectionne la valeur passée en paramètre
     * @param value {any} : la valeur à sélectionner
     * @param selectOnlyOneOne {boolean} spécifie si seul la valeur en question sera sélectionnée
     */
    selectValue (value,selectOnlyOne) {
        let hasChanged = false;
        selectOnlyOne = selectOnlyOne === true ? true : false;
        let newSelected = undefined;
        if(this.canHandleMultiple){
            newSelected = selectOnlyOne ? [] : [...this.state.selected];
        }
        const selectedValuesKeys = selectOnlyOne?{}:{...this.state.selectedValuesKeys};
        const sVal = this.prepareSelected({defaultValue:value});
        if(this.canHandleMultiple){
            if(sVal.length !== this.state.selected.length){
                hasChanged = true;
            }
            for(let k in sVal){
                const cVal = sVal[k];
                const keyNode = this.getNodeFromValue(cVal);
                if(!keyNode.valueKey) continue;
                if(!selectedValuesKeys[keyNode.valueKey]){
                    newSelected.push(cVal);
                    hasChanged = true;
                    selectedValuesKeys[keyNode.valueKey] = true;
                }
            }
        } else {
            const keyNode = this.getNodeFromValue(value);
            if(!keyNode.valueKey) return;
            if(!selectedValuesKeys[keyNode.valueKey]){
                newSelected = value;
                hasChanged = true;
                selectedValuesKeys[keyNode.valueKey] = true;
            }
        }
        if(hasChanged){
            this.updateSelected({selected:newSelected,selectedValuesKeys})
        }
    }

    selectAll (){
        if(!this.canHandleMultiple) return;
        const newSelected = [],selectedValuesKeys={};
        this.state.data.map((item,_index)=>{
            const key = this.keysRefs[_index];
            if(!this.state.nodes[key]) return;
            newSelected.push(this.state.nodes[key].value);
            selectedValuesKeys[this.state.nodes[key].valueKey] = true;
        });
        this.updateSelected({selected:newSelected,selectedValuesKeys,selectedText:this.getSelectedText(newSelected,selectedValuesKeys)});
    }
    unselectAll() {
        if(!this.canHandleMultiple) return;
        this.updateSelected({selected:[],selectedValuesKeys:{},selectedText:''})
    }
    unselect (oState){
        this.updateSelected({...defaultObj(oState),selected:this.canHandleMultiple ?[]:undefined,selectedValuesKeys:{},selectedText:""});
    }
    getSelectedValue (){
        return this.getSelected();
    }
    getSelected (){
        return this.state.selected;
    }
    getSelectedItems (){
        let ret = {};
        if(this.canHandleMultiple){
            Object.map(this.state.selected,(value)=>{
                const nodeKey = this.getNodeFromValue(value);
                if(!nodeKey.valueKey) return;
                const node = nodeKey.node;
                ret[node.key] = node.item;
            })
            return ret;
        } else {
            const nodeKey = this.getNodeFromValue(this.state.selected);
            if(!nodeKey.valueKey) return {};
            const node = nodeKey.node;
            return {[node.key]:node.item};
        }
    }
    refresh = (force,cb)=>{
        if(isObj(this.props.context) && typeof this.props.context.refresh === "function"){
            return this.props.context.refresh (force,cb);
        }
        if(force === true) {
            this.setState(this.prepareItems(),cb)
            return;
        }
        this.setState({sk:!this.state.sk},cb);
    }
    isSortable(){
        return false && isObj(this.fieldsToSort)? true : false;
    }
    prepareSortableFields (){
        let _sortFields = {},sortableFields = this.props.sortableFields;
        let hasSortableFields = false;
        if(isObj(sortableFields)){
            Object.map(sortableFields,(sF,i)=>{
                if(isNonNullString(sF)){
                    _sortFields[i] = sF;
                    hasSortableFields = true;
                }
            })
        } 
        if(!hasSortableFields){
            _sortFields = undefined;
        }
        return _sortFields;
    }
    sort (items,update,sortDir){
        let column = sorting.column;
        if(this.isSortable() && column){
            let dir = sorting.dir;
            let sortDir = defaultStr(sortDir).toLowerCase();
            if(sortDir =="asc" || sortDir =="desc"){
                dir = sortDir;
            } else {    
                if(this.hasAlreadySort && column === this.state.sortableField){
                    dir = dir =="asc"? "desc" : "asc";
                } else dir = "asc";
            }
            this.hasAlreadySort = true;
            items = sortBy(items,{column,dir:dir,returnArray:true});
            if(update !== false && (column !== this.state.sortableField || dir !== this.state.sortableDir)){
                this._renderedItems = undefined;
                let endItemsIndex = this.getMaxItemsToRender();
                this.prepareFetchedItems(items);
                this.hasFetchNewItems = true;
                this.setState({menuItems:items,endItemsIndex,hasMore:this.canFetchMoreItems(items,endItemsIndex),sortableField : column,sortableDir:dir})
                return items;
            }
        }
        return items;
    }

    onLayout (event) {
        const layout = event.nativeEvent.layout;
        const isMob = isMobileOrTabletMedia();
        const prevLayout = this.state.layout;
        const prevIsMob = this.state.isMobileMedia;
        const prevH = Math.abs(prevLayout.height-layout.height), prevW = Math.abs(prevLayout.width,layout.width);
        if(prevIsMob === isMob && prevH <= 20 && prevW <= 50) return;
        this.updateVisibleState({
            isMobileMedia : isMobileOrTabletMedia(),
            layout,
        });
    }
    isLoading(){
        return this.props.isLoading === true ? true : false
    }
    open (force,cb){
        let u = force;
        if(typeof force =='function'){
            u = cb;
            cb = force;
            if(typeof u =='boolean'){
                force = u;
            }
        }
        force = typeof force !== 'boolean'? false : force;
        if(this.props.disabled === true || this.props.readOnly === true || (force !== true && this.isLoading())) return;
        if(!this.state.visible){
            if(this.props.withBottomSheet){
                getContentHeight(this.anchorRef).then(({height})=>{
                    this.updateVisibleState({visible:true,anchorHeight:height},cb)
                })
            } else {
                this.updateVisibleState({visible:true},cb);
            }
        }
    }
    show(force,cb){
        return this.open(force,cb);
    }

    updateVisibleState(state,cb){
        state = defaultObj(state);
        const visible = this.state.visible;
        this.setState(state,()=>{
            const arg = {context:this,selected:this.state.selected,visible:this.state.visible};
            if(visible !== this.state.visible){
                if(!this.state.visible){
                    if(typeof this.props.onDismiss =='function'){
                        this.props.onDismiss(arg);
                    }
                } else if(typeof this.props.onOpen =='function'){
                    this.props.onOpen(arg);
                }
            }
            if(typeof cb =='function'){
                cb (arg);
            }
        })
    }

    hide (cb){
        return this.updateVisibleState({visible:false},cb);
    }
    close (cb){
        return this.hide(cb);
    }
    canHandleFilter(){
        return this.props.disabled !== true && this.props.readOnly !==true && this.state.visible ? true : false;
    }
    focus = ()=>{
        if(this.canHandleFilter() && this.inputRef && this.inputRef.current){
            if(this.inputRef.current.focus){
                this.inputRef.current.focus();
            } else if(this.inputRef.current.forceFocus){
                this.inputRef.current.forceFocus();
            }
        }
    }
    runSearchFilter (text){
        clearTimeout(this.doSearchFilter);
        if(!this.state.visible) {
            if(this.state.isFiltering){
                this.setState({isFiltering:false});
            }
            return;
        }
        this.setState({isFiltering:true,filterText:text});
    }
    getItems (){
        if(!this.state.visible || this.isLoading()){
            return [];
        }
        if(this.canHandleFilter() && this.state.isFiltering && this.state.filterText){
            const filterRegex = new RegExp(this.state.filterText.replace(matchOperators, '\\$&'), 'gi');
            this.keysRefs = [];
            return this.state.data.filter((item,_index)=>{
                const key = this.state.keys[_index];
                if(!isObj(this.state.nodes[key])) return false;
                if(this.state.nodes[key].textContent.match(filterRegex)){
                    this.keysRefs.push(key);
                    return true;
                }
                return false;
            })
        }
        this.keysRefs = this.state.keys;
        return this.state.data;
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        if(typeof this.props.onUnmount =="function"){
            this.props.onUnmount({context:this,selected:this.state.selected,items:this.state.data})
        }
    }
    componentDidMount(){
        super.componentDidMount();
        if(typeof this.props.onMount =='function'){
            this.props.onMount({context:this,selected:this.state.selected,items:this.state.data});
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        const {items,defaultValue,selected} = nextProps;
        const isFunc = typeof nextProps.items == "function";
        if(isFunc || !React.areEquals(items,this.props.items)){
            const nState = this.prepareItems({items,defaultValue,selected});
            return this.updateSelected(nState,!isFunc);
            const val = this.prepareSelected({defaultValue});
            if(!this.compare(val,this.state.selected)){
                return this.selectValue(defaultValue,true);
            }
            return;
        }
        let value = this.prepareSelected({defaultValue});
        let areEquals = !this.canHandleMultiple ? this.compare(value,this.state.selected) : false;
        if(areEquals) return;
        let selectedValuesKeys = {}, newSelected = this.canHandleMultiple ? [] : value;
        if(this.canHandleMultiple){
            areEquals = value.length === this.state.selected.length;
            if(areEquals && !value.length){
                areEquals = true;
            } else for(let i in value){
                const valueKey = this.getValueKey(value[i]);
                if(valueKey){
                    if(!selectedValuesKeys[valueKey]){
                        newSelected.push(value[i]);
                    }
                    selectedValuesKeys[valueKey] = true;
                    if(areEquals && !this.state.selectedValuesKeys[valueKey]){
                        areEquals = false;
                    }
                }
            } 
        } else {
            const valueKey = this.getValueKey(value);
            if(valueKey){
                selectedValuesKeys[valueKey] = true;
                newSelected  = value;
            } else {
                newSelected = undefined;
                selectedValuesKeys = {};
                if(!areEquals){
                    areEquals = this.state.selected === undefined || this.state.selected ===''? true : false;
                }
            }
        }
        if(areEquals) return;
        this.setState({
            selectedValuesKeys,
            selected:newSelected,
            selectedText : this.getSelectedText(newSelected,selectedValuesKeys)
        });
    }
    isVisible(){
        return this.state.visible;
    }
    getBackgroundColor(){
        return theme.surfaceBackground;
    }
    render (){
        let {
            multiple:_multiple,
            itemContainerProps,
            onDismiss,
            onOpen,
            onClose,
            value,
            selected,
            visible: _visible,
            itemProps,
            disabled,
            readOnly,
            defaultValue,
            selectedColor,
            label,
            display,
            text,
            placeholder,
            inputProps,
            items,
            getItemKey,
            helperText,
            error,
            onChange,
            onMount,
            filter,
            onUnmount,
            itemValue,
            name,
            anchorChildren,
            compare : _compare,
            renderItem,
            listProps,
            dynamicContent,
            dropdownActions,
            renderText,
            sortableFields,
            isLoading,
            progressBarProps,
            addIcon,
            addIconTooltip,
            addIconProps,
            showAdd,
            tagProps,
            onAdd,
            showSearch,
            onAddCallback,
            onAddPress,
            itemLabel,
            checkedIcon:customCheckedIcon,
            mode,
            withBottomSheet,
            context : contextProps,
            getValueKey,
            bindResizeEvents,
            left,
            right,
            backgroundColor : cBackgroundColor,
            dialogProps,
            ...dropdownProps
        } = this.props;

        const flattenStyle = StyleSheet.flatten(dropdownProps.style) || {};
        itemContainerProps = defaultObj(itemContainerProps);
        dropdownProps = defaultObj(dropdownProps);
        const multiple = this.canHandleMultiple;
        const renderTag = multiple && (display == 'tags' || display === 'tag' )? true : false;
        this.willRenderTag = renderTag;
    

        itemProps = defaultObj(itemProps);
        disabled = defaultBool(disabled,false);
        readOnly = defaultBool(readOnly,false);
        
        listProps = defaultObj(listProps);
        selectedColor = (Colors.isValid(selectedColor)? selectedColor : theme.colors.primaryOnSurface);
        this.selectedColor = selectedColor;

        const {layout:inputLayout,selectedText,visible,isFiltering,filterText} = this.state;
        const self = this,state = this.state;
        const canHandle = !this.isLoading();
        const canFilter = !disabled && !readOnly && visible;
        const isMob = isMobileOrTabletMedia();
        inputProps = defaultObj(inputProps);
        const contentContainerProps = Object.assign({},inputProps.contentContainerProps);
        const containerProps = Object.assign({},inputProps.containerProps);
        const inputRest = {disabled,readOnly,label,error}
        clearTimeout(this.doSearchFilter);
        this.doSearchFilter = null;
        mode = defaultStr(mode,inputProps.mode);
        const textInputProps = {
            ...inputRest,
            mode,
            disabled,
            style : StyleSheet.flatten([styles.input,inputProps.style])
        }
        const dimensions = Dimensions.get("window");
        let contentContainerHeight = dimensions.height - defaultDecimal(inputLayout?.top) - defaultDecimal(inputLayout?.height)-20;
        contentContainerHeight = Math.max(contentContainerHeight,200);
        if(isMob){
            contentContainerHeight = '95%';
        }
        const iconDisabled = !canHandle || disabled || readOnly ?true : false;
        const pointerEvents = iconDisabled?"none":"auto";
        addIconTooltip = defaultStr(addIconTooltip,'Ajouter un élément');
        addIconProps = defaultObj(addIconProps);
        if(disabled || readOnly){
            showAdd = false;
        }
        if(typeof showAdd ==='function'){
            showAdd = showAdd(props);
        }
        showAdd = defaultBool(showAdd,false);
        if(addIcon ===false) {
            showAdd = false;
        } 
        const addIconColor = Colors.isValid(addIconProps.color)? addIconProps.color :  Colors.toAlpha(theme.colors.text,theme.ALPHA);
        const _addIconProps = {
            icon : isNonNullString(addIcon)?addIcon:'plus-thick',
            tooltip : addIconTooltip,
            ...addIconProps,
            color : addIconColor,
            onPress : (e)=>{
                React.stopEventPropagation(e);
                if(iconDisabled) return;
                const aArgs = {...React.getOnPressArgs(e),isMobile:isMob,context:this,visible:state.visible,field:name,props:this.props};
                if(onAdd){onAdd(aArgs);}
                else if(onAddPress){
                    onAddPress(aArgs)
                }
            },
            disabled : iconDisabled
        }
        let menuActions = [];
        Object.map(dropdownActions,(action,index)=>{
            if(!isObj(action) || (!action.text)) return;
            menuActions.push(action);
        });
        if(this.isSortable()){
            menuActions.push( {
                text : 'Trier par',
                icon : "sort",
                items : Object.mapToArray(sortableFields,(f,i)=>{
                    return {
                        text : f,
                        icon : i == sorting.column ? (sorting.dir !="desc"?"sort-ascending":"sort-descending"):"",
                        onPress : x =>{
                            React.stopEventPropagation(x);
                            this.sort(i);
                        }
                    }
                })
                
            })
        }
        if(canFilter && filterText){
            menuActions.push({
                icon : 'close',
                onPress : ()=>{
                    this.setState({filterText:''});
                },
                text : 'Effacer le texte',
            });
        }
        if(multiple){
            menuActions.push( {
                text : 'Tout sélectionner',
                icon : 'checkbox-multiple-marked',
                onPress : this.selectAll.bind(this),
            });
            menuActions.push({
                text : 'Tout Désélectionner',
                icon : 'checkbox-multiple-blank-outline',
                onPress : this.unselectAll.bind(this),
            });
        } else if(!multiple && state.selected !== undefined){
            menuActions.push( {
                text : 'Désélectionner',
                icon : 'select',
                onPress : this.unselect.bind(this)
            });
        }
        
        if(renderTag){
            tagProps = defaultObj(tagProps);
        }
        helperText = <HelperText disabled = {disabled} error={error}>{helperText}</HelperText>
        let labelTextField = defaultVal(label,text);
        const isFlatMode = textInputProps.mode  === flatMode;
        const dropdownStyle = StyleSheet.flatten(dropdownProps?.style);
        let backgroundColor = Colors.isValid(cBackgroundColor)? cBackgroundColor : Colors.isValid(dropdownStyle?.backgroundColor)? dropdownStyle?.dropdownStyle: Colors.isValid(textInputProps.style.backgroundColor)?textInputProps.style.backgroundColor : Colors.isValid(flattenStyle.backgroundColor)? flattenStyle.backgroundColor : this.getBackgroundColor();
        const tagLabelStyle = {backgroundColor,color:Colors.setAlpha(theme.colors.text,theme.ALPHA)}
        if(!isFlatMode && backgroundColor ==='transparent'){
            tagLabelStyle.backgroundColor = this.surfaceBackground();
        }
        textInputProps.style.backgroundColor = backgroundColor;
        progressBarProps = defaultObj(progressBarProps);

        const loadingElement = !canHandle && !this.props.isFilter ? (<View testID={testID+"_DropdownActivityIndicatorContainer"} style = {[{paddingRight : 20}]}>
            <ActivityIndicator 
                color={error?theme.colors.error:theme.colors.secondary} 
                animating={true} 
                testID={testID+"_DropdownActivityIndicator"} 
                {...progressBarProps} 
            />
        </View>): null;
        const tagsContent = renderTag ? <View style={[styles.tagsContent]} testID={testID+"_TagsContainerWrapper"}>
            {state.selected.map((value,i)=>{
            const nodeKey = this.getNodeFromValue(value);
            if(!nodeKey.valueKey) return null;
            const valueKey = nodeKey.valueKey;
            const {text} = nodeKey.node;
            const p = Colors.getAvatarStyleFromSuffix(i+1);
            return <Chip 
                {...tagProps}
                style = {[p.style,{color:p.color,marginBottom:5,marginRight:5},tagProps.style]}
                textStyle = {[{color:p.color},tagProps.textStyle]}
                key = {i}
                onPress = {()=>{
                    this.selectItem({value,valueKey,select:false});
                }}
                onClose = {()=>{
                    this.selectItem({value,valueKey,select:false});
                }}
            >{text} </Chip>;
        })}
        </View> : null;
        const testID = defaultStr(dropdownProps.testID,"RN_DropdownComponent");
        const defRight = defaultVal(textInputProps.right,inputProps.right);
        const enableCopy = defaultBool(inputProps.enableCopy,textInputProps.enableCopy,(iconDisabled || (!multiple && !showAdd)) && !loadingElement ?true : false);
        const anchor = <Pressable
                activeOpacity = {0.3}   
                onPress={this.open.bind(this)}
                disabled = {disabled}
                onLayout={bindResizeEvents === false ? undefined : this.onLayout.bind(this)}
                style = {{pointerEvents}}
                aria-label={defaultStr(dropdownProps["aria-label"],label,text)}
                testID = {testID}
            >
                <View {...dropdownProps} {...contentContainerProps} style={[contentContainerProps.style,{pointerEvents},flattenStyle]}
                    ref = {this.anchorRef}
                    collapsable = {false}
                >
                    {<TextField
                        defaultValue={selectedText}
                        autoHeight = {renderTag}
                        useReadOnlyOpacity = {!disabled && !readOnly ? false : true}
                        {...inputProps}
                        {...textInputProps}
                        mode = {mode}
                        enableCopy = {enableCopy}
                        label = {labelTextField}
                        style = {[inputProps.style,textInputProps.style,{pointerEvents:"none"}]}
                        disabled = {disabled}
                        readOnly = {true}
                        alwaysUseLabel = {renderTag?true : false}
                        contentContainerProps = {{
                            ...contentContainerProps,
                            style : [renderTag? styles.inputContainerTag:null,{pointerEvents:iconDisabled && (!enableCopy && disabled)?'none':'auto'},styles.anchorContentContainer,contentContainerProps.style],
                        }}
                        containerProps = {{...containerProps,style:[containerProps.style,styles.mbO]}}
                        error = {!!error}
                        right = {loadingElement ? loadingElement : disabled? null : (props)=>{
                            let r = React.isValidElement(defRight)?<>{defRight}</> : <></>;
                            if(typeof defRight =='function'){
                                const t = defRight(props);
                                r = React.isValidElement(t)? r = <>{t}{r}</> : r;
                            }
                            if(React.isValidElement(this.props.right)){
                                r = <>{this.props.right}{r}</>
                            } else if(typeof this.props.right =='function'){
                                const t = this.props.right(props);
                                r = React.isValidElement(t)? r = <>{t}{r}</> : r;
                            }
                            if(showAdd){
                                return <>{r}<Icon {..._addIconProps} {...props} style={[theme.styles.noMargin,theme.styles.noPadding,_addIconProps.style,props.style]}/></>
                            }
                            return r;
                        }}
                        onPress = {this.open.bind(this)}
                        placeholder={placeholder}
                        render = {!renderTag?inputProps.render : (tagProps)=>{
                            return <View style={[styles.tagsContentContainer,{pointerEvents},isFlatMode?styles.tagsContentContainerFlatMode:null]}>
                                {tagsContent}
                            </View>
                        }}
                        helperText = {''}
                        children = {anchorChildren}
                    />}
                    {!canHandle && isFlatMode && <ProgressBar  color={theme.colors.secondary} {...defaultObj(progressBarProps)} indeterminate />}
                    {helperText}
            </View>
        </Pressable>

        let restProps = {};
        if(!isMob){
            restProps.withScrollView = false;
            restProps.sameWidth = true;
        } else {
            restProps.fullScreen = true;
            restProps.maxActions = 0;
            restProps.actions = [{
                icon : 'check',
                text : 'Fermer',
                onPress : this.close.bind(this),
            }]
        }
        const Component = withBottomSheet === true ? BottomSheet : isMob ? Dialog : Menu ;
        const MComponent = withBottomSheet === true ? BottomSheetMenu : MenuComponent;
        if(withBottomSheet){
            restProps.controlled = true;
            restProps.height = this.state.anchorHeight;
            restProps.withScrollView = false;
            restProps.pointerEvents = "auto";
        }
        const renderingItems = this.getItems();
        const isDisabled = readOnly || disabled?true:false;
        const isBigList = this.isBigList;
        const autoFocus = canAutoFocusSearchField({visible,items:renderingItems});
        dialogProps = defaultObj(dialogProps);
        if(this.props.name =="RG_Compta"){
            restProps.testMeCompta = true;
        }
        return (
            <Fragment>
                {!withBottomSheet && isMob && anchor}
                <Component
                    dismissable
                    {...restProps}
                    testID = {testID+"_ModalComponent"}
                    withScrollView = {false}
                    visible={visible}
                    onDismiss={this.hide.bind(this)}
                    contentStyle = {[{paddingVertical:0},restProps.contentStyle]}
                    anchor={anchor}
                    {...dialogProps}
                    title = {defaultStr(dialogProps.title,label,text)+" [ "+self.state.data.length.formatNumber()+" ]"}
                    subtitle = {selectedText||'Aucun élément sélectionné'}
                    style = {[restProps.style]}
                    contentProps = {{style:{flex:1}}}
                >
                <View style={[
                        styles.contentWrapper,
                        {     
                            //paddingRight : 0,
                            //paddingLeft : !isMob ? 5 : undefined,
                            height : !isMob?contentContainerHeight:'90%',
                        },
                        isMob && {flex:1},
                        {pointerEvents}
                    ]}
                    testID = {testID+"_Container"}
                >
                    {showSearch !== false && <>
                        <TextField
                            testID = {testID+"_SearchField"}
                            affix = {false}
                            {...textInputProps}
                            dynamicBackgroundColor = {false}
                            mode = {flatMode}
                            disabled = {iconDisabled}
                            outlined = {false}
                            defaultValue = {filterText}
                            containerProps = {{style:styles.searchContainer}}
                            contentContainerProps = {{style:[styles.inputContainer]}}
                            placeholder = {"rechercher ["+self.state.data.length.formatNumber()+"]"}
                            label = {""}
                            error = {error}
                            style = {[styles.searchInput,textInputProps.style,{backgroundColor:'transparent'}]}
                            ref = {this.inputRef}
                            autoFocus = {autoFocus}
                            onMount = {()=>{
                                if(autoFocus){
                                    this.focus();
                                }
                            }}
                            onChangeText = {debounce((text)=>{
                                if(!text && !multiple){
                                    return this.unselect({filterText:''});
                                }
                                return this.runSearchFilter(text);
                            },getSearchTimeout(this.state.data.length))}
                            left = {(props)=><Icon testID = {testID+"_Left"} icon={'magnify'} {...props} style={[styles.left,props.style]} />}
                            right = {(props)=>{
                                return <>
                                    {showAdd && isMob ? <Icon testID = {testID+"_ShowAddIcon"} {..._addIconProps} {...props} size={ICON_SIZE} style={[_addIconProps.style,styles.iconRight,props.style]}/> : null}
                                        <MComponent 
                                            items = {menuActions}
                                            closeOnPress
                                            withBottomSheet = {withBottomSheet}
                                            anchor = {(props1)=>{
                                                return <Icon
                                                    {...props1}
                                                    {...props}
                                                    name = {MORE_ICON}
                                                    size = {ICON_SIZE}
                                                    style = {[styles.iconRight,styles.anchorIcon,props.style]}
                                                />
                                            }}
                                        />
                                </>
                            }}
                            onBlur = { (e)=>{
                                this.isFiltering  = false;
                            }}
                            helperText = ""
                        />
                    </>}
                    {showSearch !== false && <Divider disabled={isDisabled} style={{marginRight:10,marginBottom:5}}/>}
                    {isMob && tagsContent}
                    {isMob && helperText ? <View testID = {testID+"_HelperText"} style={[styles.helperText]}>
                        {helperText}
                    </View>: null}
                    <BigList
                        testID = {testID+"_List"}
                        {...listProps}
                        ref = {this.listRef}
                        responsive = {false}
                        contentContainerStyle = {[{backgroundColor},listProps.contentContainerStyle]}
                        style = {[listProps.style]}
                        prepareItems = {false}
                        items = {renderingItems} 
                        keyExtractor = {this.getItemKey.bind(this)}
                        renderItem = {function({item,index:_index}){
                            const key = self.keysRefs[_index];
                            if(!isObj(self.state.nodes[key])) {
                                return null;
                            }
                            if(renderTag && (self.state.nodes[key].valueKey in self.state.selectedValuesKeys)){
                                return null;
                            }
                            const node = self.state.nodes[key];
                            const {index,value,valueKey} = node;
                            const _isSelected = self.isSelected(value,valueKey);
                            if(dynamicContent){
                                const callArgs = self.getCallArgs({item,index,items:renderingItems,_index:node._index});
                                node = self.getNode({item,key,itemProps,name,selected : _isSelected,index,_index,callArgs,key})
                            }
                            if(!isObj(node)) return null;
                            let {content} = node;
                            const style = _isSelected ? {color:selectedColor,fontWeight:'bold'} : null;
                            if(typeof (content) ==="string"){
                                content = <Label splitText {...itemProps} style={[itemProps.style,styles.item,style]}>{content}</Label>
                            }
                            const testID = "RN_DropdownItem_"+key;
                            const select = !_isSelected;
                            const checkedIcon = typeof customCheckedIcon == 'function'? customCheckedIcon({item,multiple,key,itemProps,name,selected : _isSelected,index,_index,callArgs,key}) : undefined;
                            const onItemPress = (e) => {
                                React.stopEventPropagation(e);
                                self.selectItem({value,valueKey,select:!multiple?true:select});
                            };
                            return (
                                <>
                                    <Tooltip key={key} 
                                        title = {content}
                                        testID = {testID+"_DropdownTooltipContainer"}
                                        //style = {[[theme.styles.h100]]}
                                        tooltipProps = {{style:[theme.styles.h100,theme.styles.w100],testID:testID+"_DropdownTooltipPopoverContainer"}}
                                        onPress={onItemPress}
                                        Component={TouchableRipple}
                                        //testID={testID+"Container"}
                                        style={[
                                            styles.itemContainer,{minHeight:!isBigList?MIN_HEIGHT:undefined},
                                            _isSelected && styles.itemContainerBold
                                        ]}
                                    >
                                        <>
                                            {_isSelected ? <Icon onPress={onItemPress} name={isNonNullString(checkedIcon)?checkedIcon : (multiple || _isIos?"check":'radiobox-marked')} style={[styles.checkedIcon]} color={selectedColor} /> : null}
                                            {content}
                                        </>
                                </Tooltip>
                                <Divider disabled={isDisabled}/>
                                </>
                        )}}
                    />
                </View>
            </Component>
        </Fragment>);
    }
}

const styles = StyleSheet.create({
    contentWrapper : {
        paddingHorizontal : 0,
        paddingVertical:0,
    },
    inputContainerTag : {
        paddingTop:7,
        minHeight : 50,
    },
    item : {
        fontSize:14,
    },
    itemContainer : {
        flexDirection : 'row',
        flex : 1,
        alignItems : 'center',
        paddingHorizontal : 8,
        fontWeight : "normal",
    },
    itemContainerBold : {
        fontWeight : "bold",
    },
    left : {
        paddingHorizontal:0,
        marginHorizontal : 0,
        paddingVertical : 0,
    },
    anchorContentContainer : {
        backgroundColor : 'transparent',
    },
    searchInput : {
        paddingLeft : 8,
    },
    helperText : {
        paddingHorizontal : 8,
    },
    checkedIcon : {
        margin : 0,
        padding : 0,
        marginLeft : -8,
    },
    searchWrapper : {
        height : ICON_SIZE+ICON_OFFSET,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    searchContainer : {
        //width : undefined,
        marginTop : 0,
        marginVertical : 0,
        paddingVertical : 0,
        marginBottom:0,
    },
    inputContainer : {
        height : 50,
        minHeight : undefined,
        paddingVertical : 0,
    },
    mbO : {
        marginBottom:0,
    },
    row : {
        flexDirection:'row',
        justifyContent : 'center',
        alignItems : 'center'
    },
    iconRight : {
        width : ICON_SIZE+7,
        height : ICON_SIZE+7
    },
    anchorIcon : {marginRight:10,marginLeft:5},
    input : {},
    hidden : {
        height : 0,
        display : 'none',
        width : 0
    },
    tagsContentContainer : {
        flex : 1,
        marginTop : 0,
        paddingTop : 10,
        paddingHorizontal:5,
        justifyContent : 'center',
    }, 
    tagsContentContainerFlatMode : {
        marginTop : -10,
        paddingTop : 10,
    },
    tagsContent : {
        flexDirection: 'row',
        flexWrap: 'wrap',
        //paddingHorizontal: 12,
        marginBottom : 0,
        marginBottom : 0,
        marginTop : 5,
    },
    tagLabel : {
        flexGrow : 0,
        paddingHorizontal:5,
    },
    tagLabelFlatMode : {
        //paddingTop : 10,
        marginBottom : 10,
    },
    tagLabelOutlinedMode : {
        position : 'absolute',
        top :-10,
        left : 0,
        marginLeft : 12,
    }
})

DropdownComponent.propTypes = {
    onAddCallback : PropTypes.func,
    backgroundColor : PropTypes.string,//le background color du list
    checkedIcon : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),///l'icone des éléments sélectionnés
    onAddPress : PropTypes.func,//la fonction de rappel appelée lorsqu'on clique sur l'action onAdd
    showSearch : PropTypes.bool,
    /**** cette fonction est appélée pour récupérer de manière unique les clés des valeurs lorsque les valeurs retournées du Dropdown sont de type object */
    getValueKey : PropTypes.func,
    withBottomSheet : PropTypes.bool, //si le dropdown sera rendu en utilisant le composant BottomSheet
    anchorChildren : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]), //le contenu enfant à afficher après l'anchor
    /**** les actions supplémentaires à ajouter au menu items du dropdown */
    dropdownActions : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object),
    ]),
    onChange : PropTypes.func,///onGoBack params : {value:selected,selectedItems : getSelectedItems(),items:state.data,keys:state.keys,selectedItem}
    visible: PropTypes.bool,
    itemContainerProps : PropTypes.object,///les props de la view wrapper à chaque item
    multiple : PropTypes.bool,
    onDismiss: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    value: PropTypes.any,
    onMount : PropTypes.func,
    onUnmount : PropTypes.func,
    label : PropTypes.string,
    placeholder : PropTypes.string,
    inputProps : PropTypes.object,
    selectedColor:PropTypes.string,
    "aria-label" : PropTypes.string,
    compare : PropTypes.func,
    temProps : PropTypes.object,
    itemLabel : PropTypes.string,//le nom du champ à utiliser pour le rendu du libelé la méthode appelée pour retourne le libelé de l'item
    itemValue : PropTypes.oneOfType([PropTypes.func]),//le nom du champ de la valeur à récupérer
    renderItem : PropTypes.oneOfType([PropTypes.func]),
    /*** la fonction permettant d'afficher le texte du dropdown */
    renderText : PropTypes.func,
    items :  PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.func, //la fonction doit retourner, soit un tableau, soit un objet des données. elle ne doit en aucun cas retourner une promesse
    ]),
     /**** l'info bulle a associer à l'iconne addIcon */
     addIcon : PropTypes.oneOfType([PropTypes.string,PropTypes.bool]), //l'icon plus
     addIconTooltip : PropTypes.string,
     addIconProps : PropTypes.object,
     /** display est exploité lorsque la props multiple est à true
     *  valeurs : 
     */
      display : PropTypes.oneOf([
        'menu',
        'tag', //le rendu des valeurs sélectionné sera en tags
        'tags' //le rendu sera en texte
    ]),//le type d'affichage, valide lorsque la valeur multiple est à true
    //le contenu à aficher après le rendu des tags, lorsque le type de rendu, props display = tags ou tag
    tagContent  : PropTypes.any,
    /*** les tagsProp sont les tags des différents éléments à afficher en cas de rendu multiple 
     *  ils sont semblables à ceux attendus du composant Chip de react native paper
    */
    tagProps : PropTypes.shape({
        ...defaultObj(Chip.propTypes),
    }),
    contentContainerProps : PropTypes.object,///les props du container aux TextInput
    filter: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),
    /*** la liste des champs qu'on peut trier sur forme de clé/libelé */
    sortableFields : PropTypes.object,
    showAdd : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),
    onAdd : PropTypes.func,
    getItemKey : PropTypes.func,///la fonction prenant en paramètre un item et retourne sa clé unique
}


export default DropdownComponent;