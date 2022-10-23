import React from "$react";
import {defaultObj,isDecimal,defaultStr,debounce,extendObj,defaultVal,defaultFunc} from "$utils";
import TextField,{flatMode} from "$ecomponents/TextField";
import {TouchableOpacity,Dimensions,StyleSheet} from "react-native";
import { TouchableRipple} from "react-native-paper";
import View from "$ecomponents/View";
import Divider from "$ecomponents/Divider";
import Menu from "$ecomponents/Menu/Menu";
import theme,{Colors,StylePropTypes} from "$theme";
import List,{MIN_HEIGHT} from "$ecomponents/List";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import Icon from "$ecomponents/Icon";
import {isDesktopMedia} from "$cplatform/dimensions";
import { matchOperators,getSearchTimeout,canAutoFocusSearchField} from "$ecomponents/Dropdown/utils";
import Dialog from "$ecomponents/Dialog";

const  SimpleSelect = React.forwardRef((props,ref)=>{
    let {style : customStyle,onMount,mode,showSearch,anchorContainerProps,renderText,contentContainerProps,withCheckedIcon,testID,selectionColor,dialogProps,onShow,anchor,onUnmont,controlled,onDismiss,visible:controlledVisible,selectedColor,inputProps,itemProps,itemContainerProps,label,listProps,editable,readOnly,text,filter,renderItem,itemValue,getItemValue,defaultValue,items:menuItems,onPress,onChange,disabled,...rest} = props;
    const flattenStyle = StyleSheet.flatten(customStyle) || {};
    const [state,setState] = React.useState({
        value : defaultValue !== undefined? defaultValue:undefined,
        visible : controlled?undefined:false,
        layout : {
            height: 0,
            width: 0,
        },
    });
    contentContainerProps = defaultObj(contentContainerProps);
    const inputLayout = state.layout;
    const prevLayout = React.usePrevious(inputLayout);
    filter = defaultFunc(filter,x=>true);
    const value = state.value,
    visible = controlled? controlledVisible : state.visible;
    compare = defaultFunc(compare,(a,b)=> a === b);
    const prevValue = React.usePrevious(value,compare);
    const setSelected = (node,update)=>{
        if(update !== true && compare(value,node.value)) return;
        selectedRef.current = node;
        if(update === true){
            const nState = {...state,value:node.value,visible:controlled?undefined:false};
            if(controlled && onDismiss){
                if(onDismiss(nState,defaultObj(selectedRef.current)) === false) return;
            }
            setState(nState);
        }
    }
    const selectedRef = React.useRef(undefined);
    const listRef = React.useRef(null);
    const isSelected = (itValue,index)=> {
        return itValue !== undefined && compare(value,itValue)?true : false;
    };
    itemValue = typeof getItemValue =='function'? getItemValue : typeof itemValue =='function'? itemValue : ({item,index})=>{
        if(isNonNullString(item) || typeof item =='number') {
            return index;
        }
        if(isObj(item)) {
            if(isNonNullString(item._id)) return item._id;
            if(isNonNullString(item.code)) return item.code;
            return index;
        }
        return index;
    };
    renderText = typeof renderText ==='function'? renderText : ({item,content,index})=>{
        return React.getTextContent(content);
    }
    const prepareItems = React.useCallback(()=>{
        const items = [];
        selectedRef.current = null;
        Object.map(menuItems,(item,index,_index)=>{
            if(React.isValidElement(item) || !filter({items:menuItems,item,_index,index})) return null;
            const backupItem = item;
            if(!isObj(item)) {
                if(isDecimal(item) || isNonNullString(item)){
                    item = {label:item+""};
                } else return null;
            }
            const {code,label,text} = item;
            let itValue = itemValue({item:backupItem,index,_index});
            if(itValue === undefined){
                itValue = isNonNullString(code)? code : index;
            }
            const mItem = {item:backupItem,value:itValue,index,_index};
            let content = renderItem ? renderItem({item:backupItem,index,_index,value:itValue}) : defaultVal(label,text,code);
            if(isDecimal(content)) content+="";
            if(!React.isValidElement(content,true)) return null;
            mItem.content = content;
            mItem.textContent = renderText(mItem);
            if(isSelected(itValue,index)){
                selectedRef.current = mItem;
            }
            items.push(mItem);
        })
        setItems(items);
    },[menuItems])
    const [items,setItems] = React.useStateIfMounted([]);
    React.useEffect(()=>{
        prepareItems();
    },[menuItems]);
    
    const context = {};
    const selectValue = context.selectValue = context.setValue = (defaultValue)=>{
        if(compare(defaultValue,value)) return;
        selectedRef.current = undefined;
        for(let i in items){
            if(compare(items[i].value,defaultValue)){
                selectedRef.current = items[i];
                break;
            }
        }
        if(selectedRef.current){
            setState({...state,value:defaultValue});
        }
    }
    context.getValue = ()=> value;
    React.useEffect(()=>{
        selectValue(defaultValue);
    },[defaultValue])
    React.useEffect(()=>{
        if((value !== undefined || prevValue !== undefined) && compare(value,prevValue)) return;
        if(onChange){
            onChange(defaultObj(selectedRef.current));
        }
    },[value]);
    const [canEdit,setCanEdit] = React.useState(true);
    const isEditable = canEdit && !disabled && !readOnly && editable !== false ? true : false;
    const pointerEvents = isEditable ? "auto" : "none";
    const isMob = !isDesktopMedia();
    const prevIsMob = React.usePrevious(isMob);
    const show = context.open = (event)=>{
        React.stopEventPropagation(event);
        if(!isEditable) return;
        if(controlled){
            if(onShow){
                onShow(state);
            }
            return;
        }
        if(!visible){
            setState({...state,visible:true});
        }
    }
    const close = context.close = (args)=>{
        if(controlled){
            if(onDismiss){
                onDismiss(state,defaultObj(selectedRef.current));
            }
            return false;
        }
        setState({...state,visible:false,sk:!!!state.sk});
        return false;
    }
    context.disable = ()=>{
        if(!canEdit) return;
        setCanEdit(false);
    }
    context.enable = ()=>{
        if(canEdit) return;
        setCanEdit(true);
    }
    context.disabled = !isEditable;
    context.enabled = isEditable;

    React.useEffect(()=>{
        React.setRef(ref,context);
        if(onMount ==='function'){
             onMount({context})
        }
        return ()=>{
            React.setRef(ref,null);
            if(onUnmont){
                onUnmont({context})
            }
        }
    },[]);

    inputProps = defaultObj(inputProps);
    itemProps = defaultObj(itemProps);
    listProps = defaultObj(listProps);
    inputProps.style = StyleSheet.flatten(inputProps.style) || {};
    inputProps.style.backgroundColor = Colors.isValid(flattenStyle.backgroundColor)? flattenStyle.backgroundColor : Colors.isValid(inputProps.style.backgroundColor)? inputProps.style.backgroundColor : 'transparent';
    itemContainerProps = defaultObj(itemContainerProps);
    const onLayout = (event) => {
        const layout = event.nativeEvent.layout;
        if(prevIsMob === isMob && layout.height == prevLayout.height && layout.width == prevLayout.width) return;
        const isDiff = prevIsMob !== isMob;
        const nState = {
            ...state,
            layout,
            //visible : controlled ? undefined : isDiff ? false : visible
        };
        setState(nState);
        if(controlled && onDismiss){
            if(isDiff){
                onDismiss(nState,true);
            }
        } 
    };
    const dimensions = Dimensions.get("window");// useWindowDimensions();
    let contentContainerHeight = dimensions.height - defaultDecimal(inputLayout?.top) - defaultDecimal(inputLayout?.height)-20;
    contentContainerHeight = Math.max(contentContainerHeight,200);
    let marginTop = 0;
    const Component = isMob ? Dialog : Menu;
    dialogProps = defaultObj(dialogProps);
    let rProps = {};
    if(!isMob){
        rProps.handleScroll = false;
    } else {
        rProps = {
            ...dialogProps,
            title : defaultStr(dialogProps.title,label,text)+" ["+items.length+"]",
            fullScreen : true,
            subtitle : selectedRef.current?.textContent,
            actions : [{
                icon:'check',
                text : 'Sélectionner',
                onPress : close,
            }]
        }
    }
    selectedColor = (Colors.isValid(selectedColor)? selectedColor : theme.colors.primaryOnSurface);
    const selectedObj = {};
    if(isObj(selectedRef.current)){
        selectedObj.selectedItem = selectedRef.current.item;
        selectedObj.selectedIndex = selectedRef.current.index;
        selectedObj._selecedIndex = selectedRef.current._index;
        selectedObj.selectedNode = selectedRef.current;
        selectedObj.selectedText = selectedRef.current.textContent;
        selectedObj.textContent = renderText(selectedRef.current);
    }
    anchor = React.isValidElement(anchor)? anchor : typeof anchor =='function'? anchor({
        inputProps,
        label : defaultVal(label,text,inputProps.label),
        disabled,
        readOnly,
        editable : false,
        pointerEvents,
        value,
        autoHeight : false,
        onPress : context.open.bind(context),
        ...selectedObj,
    }) : 
        <TextField
            autoHeight = {false}
            useReadOnlyOpacity = {false}
            affix = {false}
            mode = {mode}
            {...inputProps}
            label = {defaultVal(label,text,inputProps.label)}
            editable = {false}
            disabled = {disabled}
            readOnly = {readOnly}
            defaultValue = {selectedObj.textContent}
        />
    const inputRef = React.useRef(null);
    const canFilter = !props.disabled && !props.readOnly && props.editable !== false && visible;
    const [filterText,setFilterText] = React.useStateIfMounted("");
    let filterRegex = undefined;
    if(canFilter && isNonNullString(filterText)){
        filterRegex = new RegExp(filterText.replace(matchOperators, '\\$&'), 'gi');
    }
    const textInputProps = {
        disabled : props.disabled,
        editable : props.editable,
        readOnly : props.readOnly,
        label : props.label,
        mode:flatMode,
    }
    const runSearchFilter = (text)=>{
        if(!visible) {
            return;
        }
        setFilterText(text);
    }
    const getItems = React.useCallback(()=>{
        return !visible ? [] : filterRegex ? items.filter((item,index)=>{
            return item.textContent.match(filterRegex)? true : false;
        }): items
    },[filterRegex,visible,items])
    const renderingItems = getItems();
    const autoFocus = canAutoFocusSearchField({visible,items:renderingItems});
    testID = defaultStr(testID, "RN_SimpleSelectComponent");
    anchor =  <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.3}
        testID = {testID}
        {...defaultObj(anchorContainerProps)}
        onPress={show}
        disabled = {!isEditable}
        pointerEvents = {pointerEvents}
        accessibilityLabel={defaultStr(label,text)}
        rippleColor={undefined}
        onLayout={onLayout}
    >
        <>{anchor}</>
    </TouchableOpacity>
    const getItemLayout = typeof listProps.itemHeight ==='number' && listProps.itemHeight ? (data, index) => (
        {length: listProps.itemHeight, offset: listProps.itemHeight * index, index}
      ) : undefined;
    return <>
        {isMob && anchor}
        <Component
            testID = {testID+"_ModalOrDialog"}
            dismissable
            {...rProps}
            withScrollView = {false}
            items = {items}
            visible = {visible}
            onDismiss={close}
            disabled = {!isEditable}
            editable = {editable !== false? true : false}
            style = {[{marginTop}]}
            anchor = {anchor}
            contentProps = {{style:{flex:1}}}
            minWidth = {150}
            contentStyle = {[{paddingVertical:0},rProps.contentStyle]}
        >
            <View 
                testID={testID+"_Container"}
                {...contentContainerProps}
                style={[{     
                        paddingHorizontal : 10,
                        paddingVertical:0,
                        height : !isMob?contentContainerHeight:'90%',
                        width : !isMob ? inputLayout.width : undefined,
                    },
                    isMob && {flex:1},
                    !isMob && {paddingRight : 0},
                    contentContainerProps.style
                ]
                }
                pointerEvents = {pointerEvents}
            >
                {showSearch !== false && <>
                    <TextField
                        outlined = {false}
                        autoHeight
                        affix = {false}
                        autoFocus = {autoFocus}
                        testID = {testID+"_SearchField"}
                        {...textInputProps}
                        dynamicBackgroundColor = {false}
                        defaultValue = {filterText}
                        placeholder = {"rechercher ["+items.length.formatNumber()+"]"}
                        label = {""}
                        containerProps = {{style:{marginVertical:0,paddingVertical:0,padding:0,margin:0}}}
                        contentContainerProps = {{style:[theme.styles.noPadding,theme.styles.noMargin]}}
                        error = {false}
                        style = {[styles.searchInputOverride,{backgroundColor:'transparent'}]}
                        ref = {inputRef}
                        onChangeText = {debounce(runSearchFilter,getSearchTimeout(items.length))}
                        left = {(props)=>{
                            return <Icon icon={'magnify'} {...props} style={[{height:25,paddingHorizontal:0,marginLeft:-5},props.style]} />
                        }}
                        right = {null}
                    />
                    <Divider />
                </>}
                <List
                    testID = {testID+"_List"}
                    {...listProps}
                    getItemLayout = {getItemLayout}
                    ref = {listRef}
                    contentContainerStyle = {[{backgroundColor:theme.colors.surface},listProps.contentContainerStyle]}
                    style = {[listProps.style]}
                    prepareItems = {false}
                    items = {renderingItems}
                    itemHeight = {function(p){
                        if(!visible) return 0;
                        const {index} = p;
                        if(!isObj(renderingItems[index])) return 0;
                        return typeof listProps.itemHeight =='function'? listProps.itemHeight({...renderingItems[index],...p}): defaultDecimal(listProps.itemHeight,50);
                    }}
                    renderItem = {function({item,index}){
                        if(!visible) return null;
                        let node = renderingItems[index];
                        if(!isObj(node)) {
                            return null;
                        }
                        const tID = testID+"_Item"+index;
                        let {content,value} = node;
                        const _isSelected = isSelected(value,index);
                        const style = _isSelected ? {color:selectedColor,fontWeight:'bold'} : null;
                        if(typeof (content) ==="string"){
                            content = <Label testID={tID} {...itemProps} style={[itemProps.style,style]}>{content}</Label>
                        }
                        return (
                            <React.Fragment key={index}>
                                <TouchableRipple
                                    style={{
                                        flexDirection: "row",
                                        height : '100%',
                                        width : "100%",
                                        fontWeight : isSelected ? 'bold' : 'normal',
                                        alignItems: "center",
                                    }}
                                    onPress={(e) => {
                                        React.stopEventPropagation(e);
                                        setSelected(node,true);
                                    }}
                                    testID={tID+"_ContentContainer"}
                                >
                                    <View {...itemContainerProps} testID={tID+"_Content"} style={[itemContainerProps.style,styles.itemContainer]}>
                                        {content}
                                        {_isSelected && withCheckedIcon!==false ? <Icon testID={tID+"_CheckIcon"} style={[styles.icon]} icon="check" color={selectedColor} /> : null}
                                    </View>
                                </TouchableRipple>
                                <Divider />
                        </React.Fragment>
                    )}}
                />
            </View>
        </Component>
    </>

});

SimpleSelect.propTypes = {
    contentContainerProps : PropTypes.object,///les props à appliquer au container du content du selectField
    withCheckedIcon : PropTypes.bool,//si l'icone checked apparaîtra sur l'item actuellement sélectionné
    dialogProps : PropTypes.object,//les props de la boîte de dialogue lorsqu'il s'agit de l'environnement mobile
    onShow : PropTypes.func,///en mode contrôlé, lorsqu'on presse sur le bouton
    showSearch : PropTypes.bool,
    anchor : PropTypes.oneOfType([    
        PropTypes.node,
        PropTypes.func,
    ]),
    anchorContainerProps : PropTypes.object,//les props du container de l'anchor
    onDismiss : PropTypes.func,///si le composant est contrôlé
    visible : PropTypes.bool,///si le composant est contrôlé, la valeur visible doit être définie
    controlled : PropTypes.bool, //si le composant Simple select est contrôlé par un autre
    itemValue : PropTypes.func,
    getItemValue : PropTypes.func,
    renderItem : PropTypes.func,
    inputProps : PropTypes.shape({
        ...TextField.propTypes,
    }),
    /** les items sont soit un tableau d'éléments, soit un objet d'éléments de dimensions 1 de la forme : 
     *  valeur : text 
     *     */
    items : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object
    ]),
    /*** lorsque la valeur du composant select change 
     *  onChange(value,event)
     * 
    */
    onChange : PropTypes.func,
    onMount : PropTypes.func,
    onUnmont : PropTypes.func,
    compare : PropTypes.func, //la fonction de comparaison des items de type select
    style : StylePropTypes,
    /*** si le composant est désactivé */
    disabled: PropTypes.bool,
    selectionColor : PropTypes.string,//la couleur du texte de sélection du champ inputSearch

}

const styles = StyleSheet.create({
    searchInputOverride : {
       // width : '100%',
    },
    textInputContainer : {
        marginBottom : 0,
        height : 40,
        ///
    },
    //searchInput : {paddingVertical:0,paddingRight:10},
    itemContainer : {
        flexDirection : 'row',
        flex : 1,
        alignItems : 'center',
        minHeight : MIN_HEIGHT,
    },
    icon : {
        marginHorizontal : 0,
        paddingHorizontal : 0,
    },
})

SimpleSelect.displayName = "SimpleSelectComponent";

export default SimpleSelect;