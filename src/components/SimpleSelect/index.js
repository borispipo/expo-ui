import React from "$react";
import {defaultObj,defaultStr,debounce,extendObj,defaultVal,defaultFunc} from "$cutils";
import {compare as compareUtil} from "$cutils";
import TextField,{flatMode} from "$ecomponents/TextField";
import {Pressable,Dimensions,StyleSheet} from "react-native";
import { TouchableRipple} from "react-native-paper";
import View from "$ecomponents/View";
import Divider from "$ecomponents/Divider";
import Menu from "$ecomponents/Menu/Menu";
import theme,{Colors,StylePropTypes} from "$theme";
import List,{MIN_HEIGHT,BigList} from "$ecomponents/List";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import Icon from "$ecomponents/Icon";
import {isDesktopMedia} from "$cplatform/dimensions";
import { matchOperators,getSearchTimeout,canAutoFocusSearchField} from "$ecomponents/Dropdown/utils";
import Dialog from "$ecomponents/Dialog";

const isValidValue =(value)=> typeof value === "string" || typeof value === "number" || typeof value =="boolean" || isObj(value) || Array.isArray(value);

const  SimpleSelect = React.forwardRef((props,ref)=>{
    let {style : customStyle,onMount,mode,showSearch,anchorContainerProps,renderText,contentContainerProps,withCheckedIcon,testID,selectionColor,dialogProps,onShow,anchor,onUnmont,controlled:cr,onDismiss,visible:controlledVisible,selectedColor,inputProps,itemProps,itemContainerProps,label,listProps,readOnly,text,filter,renderItem,itemValue,getItemValue,defaultValue,items:menuItems,onPress,onChange,disabled,...rest} = props;
    const flattenStyle = StyleSheet.flatten(customStyle) || {};
    const controlledRef = React.useRef(typeof controlledVisible ==='boolean'? true : false);
    const controlled = controlledRef.current;
    const [layout,setLayout] = React.useState({
        height: 0,
        width: 0,
    });
    const [visible,setVisible] = controlled ? [controlledVisible] : React.useState(controlled?controlledVisible:false);
    const [value,setValue] = React.useState(defaultValue !== undefined? defaultValue:undefined);
    contentContainerProps = defaultObj(contentContainerProps);
    const prevLayout = React.usePrevious(layout);
    filter = defaultFunc(filter,x=>true);
    compare = defaultFunc(compare,compareUtil);
    const prevValue = React.usePrevious(value,compare);
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
            if(isNonNullString(item._id) || typeof item._id =="number") return item._id;
            if(isNonNullString(item.code) || typeof item.code =="number") return item.code;
            return index;
        }
        return index;
    };
    renderText = typeof renderText ==='function'? renderText : ({item,content,index})=>{
        return React.getTextContent(content);
    }
    const items = React.useStableMemo(()=>{
        const items = [];
        selectedRef.current = null;
        Object.map(menuItems,(item,index,_index)=>{
            if(React.isValidElement(item) || !filter({items:menuItems,item,_index,index})) return null;
            let backupItem = item;
            if(!isObj(item)) {
                if(isValidValue(item)){
                    item = {label:String(item),code:item};
                } else return null;
            }
            const {code,label,text} = item;
            let itValue = itemValue({item:backupItem,index,_index});
            if(itValue === undefined){
                itValue = isValidValue(code)? code : index;
            }
            const mItem = {item:backupItem,value:itValue,index,_index};
            let content = renderItem ? renderItem({item:backupItem,index,_index,value:itValue}) : defaultVal(label,text,code);
            const rText = renderText(mItem);
            if(!content && typeof content != "number"){
                content = rText;
            }
            if(typeof content !="string") content = String(content);
            if(!React.isValidElement(content,true)) {
                console.warn("Simple select, invalid meuitem content: ",content,mItem,props);
                return null;
            }
            mItem.content = content;
            mItem.textContent = React.getTextContent(rText) || React.getTextContent(content);
            if(isSelected(itValue,index)){
                selectedRef.current = mItem;
            }
            items.push(mItem);
        });
        return items;
    },[menuItems,value]);
    React.useEffect(()=>{
        if(compare(defaultValue,value)) {
            return;
        }
        selectValue(defaultValue);
    },[defaultValue]);
    const setSelected = (node,update)=>{
        if(update !== true && compare(value,node.value)) return;
        selectedRef.current = node;
        if(update === true){
            setValue(node.value);
            if(controlled && onDismiss){
                if(onDismiss({visible,value,items,defaultValue},defaultObj(selectedRef.current)) === false) return;
            }
            if(!controlled && visible){
                setVisible(false);
            }
        }
    }
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
        if(selectedRef.current !== undefined){
            setValue(defaultValue);
        }
    }
    context.getValue = ()=> value;
    React.useEffect(()=>{
        if(compare(value,prevValue)) return;
        if(onChange){
            onChange(defaultObj(selectedRef.current));
        }
    },[value]);
    const [canEdit,setCanEdit] = React.useState(true);
    const isEditable = canEdit && !disabled && !readOnly ? true : false;
    const pointerEvents = isEditable ? "auto" : "none";
    const isMob = !isDesktopMedia();
    const prevIsMob = React.usePrevious(isMob);
    const show = context.open = (event)=>{
        React.stopEventPropagation(event);
        if(!isEditable) return;
        if(controlled){
            if(onShow){
                onShow({visible,value,items,defaultValue});
            }
            return;
        }
        if(!visible){
            setVisible(true);
        }
    }
    const close = context.close = (args)=>{
        if(controlled){
            if(onDismiss){
                onDismiss({visible,value,items,defaultValue},defaultObj(selectedRef.current));
            }
            return false;
        }
       setVisible(false);
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
    React.setRef(ref,context);
    React.useEffect(()=>{
        if(onMount ==='function'){
             onMount({context,props})
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
        if(prevIsMob === isMob && Math.abs(layout.height - prevLayout.height) <=50 && Math.abs(layout.width == prevLayout.width)<=50) return;
        const isDiff = prevIsMob !== isMob;
        setLayout(layout);
        if(controlled && onDismiss){
            if(isDiff){
                onDismiss({visible,value,items,defaultValue},true);
            }
        } 
    };
    const dimensions = Dimensions.get("window");
    let contentContainerHeight = dimensions.height - defaultDecimal(layout?.top) - defaultDecimal(layout?.height)-20;
    contentContainerHeight = Math.max(contentContainerHeight,200);
    let marginTop = 0;
    const Component = isMob ? Dialog : Menu;
    dialogProps = defaultObj(dialogProps);
    let rProps = {};
    if(!isMob){
        rProps.withScrollView = false;
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
        pointerEvents,
        value,
        autoHeight : false,
        ...rest,
        onPress : context.open.bind(context),
        ...selectedObj,
    }) : 
        <TextField
            autoHeight = {false}
            useReadOnlyOpacity = {!disabled && !readOnly ? false : true}
            affix = {false}
            mode = {mode}
            {...rest}
            {...inputProps}
            label = {defaultVal(label,text,inputProps.label)}
            readOnly = {typeof readOnly ==='boolean'? readOnly : true}
            disabled = {disabled}
            defaultValue = {selectedObj.textContent}
        />
    const inputRef = React.useRef(null);
    const canFilter = !props.disabled && !props.readOnly && visible;
    const [filterText,setFilterText] = React.useState("");
    let filterRegex = undefined;
    if(canFilter && isNonNullString(filterText)){
        filterRegex = new RegExp(filterText.replace(matchOperators, '\\$&'), 'gi');
    }
    const textInputProps = {
        disabled : props.disabled,
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
    anchorContainerProps = defaultObj(anchorContainerProps);
    anchor =  <Pressable
        //role="button"
        activeOpacity={0.3}
        testID = {testID}
        {...anchorContainerProps}
        onPress={show}
        disabled = {!isEditable}
        aria-label={defaultStr(label,text)}
        rippleColor={undefined}
        onLayout={onLayout}
        style = {[{pointerEvents},anchorContainerProps.style]}
    >
        {anchor}
    </Pressable>
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
            readOnly = {readOnly === true? true : false}
            style = {[{marginTop}]}
            anchor = {anchor}
            contentProps = {{style:{flex:1}}}
            minWidth = {180}
            contentStyle = {[{paddingVertical:0},rProps.contentStyle]}
        >
            <View 
                testID={testID+"_Container"}
                {...contentContainerProps}
                style={[{     
                        paddingHorizontal : 0,
                        paddingVertical:0,
                        height : !isMob?contentContainerHeight:'90%',
                        width : !isMob ? Math.max(layout.width,180) : undefined,
                    },
                    isMob && {flex:1},
                    !isMob && {paddingRight : 0},
                    contentContainerProps.style,
                    {pointerEvents:contentContainerProps.pointerEvents||pointerEvents||undefined},
                ]
                }
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
                <BigList
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
                            content = <Label splitText testID={tID} {...itemProps} style={[itemProps.style,style]}>{content}</Label>
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
                                        paddingHorizontal : 10,
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