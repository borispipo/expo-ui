
import React from "$react";
import { prepareItems as customPrepareItems,getBToTopRef } from "./utils";
import {grid,StylePropTypes} from "$theme";
import PropTypes from "prop-types";
import {defaultObj,defaultDecimal,defaultArray,defaultFunc} from "$utils";
import {isMobileMedia} from "$platform/dimensions";
import BackToTop from "$components/BackToTop";
import {FlatList,StyleSheet,View} from "react-native";
import Label from "$components/Label";
import { useWindowDimensions,Dimensions } from "react-native";

const CommonListComponent = React.forwardRef((props,ref)=>{
    let {responsive,defaultItemHeight,itemHeight,windowWidth,componentProps,columnWrapperStyle,onViewableItemsChanged,withFlatListItem,Component,withBackToTop,backToTopRef:customBackToTopRef,withBackToTopButton,onScroll,onScrollEnd,onMount,onUnmount,renderScrollViewWrapper,prepareItems,getItemKey,getKey,keyExtractor,items,filter,renderItem,numColumns,containerProps,bindResizeEvents,...rest} = props;
    withBackToTopButton = withBackToTop === true || withBackToTopButton == true || isMobileMedia()? true : false;
    rest = defaultObj(rest);
    containerProps = defaultObj(containerProps);
    responsive = defaultBool(responsive,false);
    const dimensions = responsive ? useWindowDimensions() : Dimensions.get("window");
    if(responsive){
        numColumns = grid.numColumns(windowWidth);
    } else {
        numColumns = defaultDecimal(numColumns,1);
    }
    const itemWindowWidth = dimensions.width/numColumns;
    let scrollEndTimeout = React.useRef(null);
    const listRef = React.useRef(null);
    const hasCustomBackToTop = typeof customBackToTopRef == 'function'? true : false;
    const backToTopRef = React.useRef(null);
    const isFlatList = Component === FlatList;

    const context = {
        itemsRefs : [],
        prepareItems : defaultFunc((prepareItems === false ? (items)=> items:null),prepareItems,customPrepareItems),
        getKey : typeof keyExtractor =='function'? keyExtractor : typeof getItemKey =='function'? getItemKey : typeof getKey =='function'? getKey : undefined,
        addItemsRefs : function(ref, itemRef){
            context.itemsRefs[itemRef.index] = {
              ref,
              item: itemRef.item,
              index: itemRef.index,
            }
        },
        renderItem : function({item,index,section,...rest}){
            rest = rest ? rest : {};
            let ret = renderItem({item,numColumns,index,section,numColumns,itemContainerWidth:itemWindowWidth,itemWindowWidth,...rest,isScrolling:listRef.current?.isScrolling?true:false,items:defaultArray(context.items)});
            if(typeof ret =='string' || typeof ret =='number'){
                return <Label children = {ret}/>
            } 
            return (React.isValidElement(ret)) ? ret : null; 
        },
        /*** @params : {animated?: ?boolean,index: number,viewOffset?: number,viewPosition?: number,} */
        scrollToIndex : function(params) {
            if (listRef.current && typeof listRef.current.scrollToIndex =='function') {
              listRef.current.scrollToIndex(params);
            }
        },
        scrollToTop : function(params){
            return context.scrollToIndex({animated:true,...defaultObj(params),index:0});
        },
        /** params?: ?{animated?: ?boolean} */
        scrollToEnd : function(params) {
            if (listRef.current && listRef.current.scrollToEnd) {
              listRef.current.scrollToEnd(params);
            }
        },
        /*** @params : {animated?: ?boolean,item: ItemT,viewPosition?: number} */
        scrollToItem : function(params) {
            if (listRef.current) {
              listRef.current.scrollToItem(params);
            }
        },
        /*** @params : {animated?: ?boolean, offset: number} */
        scrollToOffset : function(params) {
            if (listRef.current) {
                listRef.current.scrollToOffset(params);
            }
        },
        handleOnScroll : (event)=>{
            if(customBackToTopRef === false) {
                if(onScroll){
                    onScroll(event);
                }
                return;
            }
            const bToTopRef = getBToTopRef(hasCustomBackToTop ? customBackToTopRef() : backToTopRef);
            if (withBackToTopButton && bToTopRef) {
                bToTopRef.toggleVisibility(event);
            }
            if(listRef.current){
                listRef.current.isScrolling = true;
                context.isScrolling = true;
            }
            clearTimeout(scrollEndTimeout.current);
            scrollEndTimeout.current = setTimeout(()=>{
                if(listRef.current){
                    listRef.current.isScrolling = false;
                    context.isScrolling = false;
                }
                clearTimeout(scrollEndTimeout.current);
                if(onScrollEnd){
                    onScrollEnd(event);
                }
            },1000);
            if(onScroll){
                onScroll(event);
            }
        },
        onScroll : function(event){
            context.handleOnScroll(event);
        },
        keyExtractor : function(item,index){
            if(context.getKey){
                return context.getKey(item,index);
            }
            return React.key(item,index);
        },
        itemHeight : typeof itemHeight =='number' && itemHeight ? itemHeight : function(section,index){
            if(typeof index ==='undefined') return 0;
            if(!Array.isArray(context.items)){
                context.items = [];
            }
            if(typeof itemHeight ==='function'){
                return itemHeight({section,numColumns,itemContainerWidth:itemWindowWidth,itemWindowWidth,index,context,item:context.items[index],items:context.items});
            }
            return defaultItemHeight
        },
        onBackActionPress : !hasCustomBackToTop ? function(){
            return context?.scrollToTop()
        }: undefined,
    };
    const contextRef = React.useRef({}).current;
    contextRef.prevItems = React.usePrevious(items);
    const getItems = React.useCallback(()=>{
        if(items === contextRef.prevItems && contextRef.items) {
            return contextRef.items;
        }
        return context.prepareItems(items,filter);
    },[items]);
    context.listRef = listRef.current;
    context.items = contextRef.items = prepareItems === false ? items : getItems();
    if(!Array.isArray(context.items)){
        console.error(context.items," is not valid list data array",props);
        context.items = [];
    }
    
    React.setRef(ref,context);
    React.useEffect(()=>{
        React.setRef(ref,context);
        if(typeof onMount =='function'){
            onMount(context);
        }
        return ()=>{
            React.setRef(ref,null);
            if(typeof onUnmount ==='function'){
                onUnmount();
            }
        }
    },[]);
    const restP = numColumns > 1 && isFlatList ? {
        columnWrapperStyle : [styles.columnWrapperStyle,props.columnWrapperStyle]
    } : {};
    return <View {...containerProps} style={[styles.container,containerProps.style]}>
        <Component
            onEndReachedThreshold={0}
            scrollEventThrottle={16}
            {...rest}
            {...restP}
            ref = {listRef}
            onScroll={context.onScroll}
            data = {context.items}
            //key = {isFlatList ? 'common-list-'+numColumns:"normal-list"}
            numColumns={numColumns}
            keyExtractor = {context.keyExtractor}
            renderItem = {context.renderItem}
            itemHeight = {itemHeight === false ? undefined : context.itemHeight}
            onViewableItemsChanged={onViewableItemsChanged}
            {...defaultObj(componentProps)}
        />
        {!hasCustomBackToTop && customBackToTopRef !== false ? <BackToTop ref={backToTopRef} onPress={context.onBackActionPress} /> : null}
    </View>
})


CommonListComponent.propTypes = {
    onViewableItemsChanged : PropTypes.func,
    ...defaultObj(FlatList.propTypes),
    defaultItemHeight : PropTypes.number,///la valeur de la hauteur des items par défaut
    backToTopRef : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),
    Component : PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.node,
        PropTypes.elementType
    ]),
    withBackToTopButton : PropTypes.bool,
    withBackToTop : PropTypes.bool,
    onScroll : PropTypes.func,
    onScrollEnd : PropTypes.func,
    /**** les props de la scrollView, qui wrapp le composant ScrollView dans le rendu BigList */
    contentContainerStyle: StylePropTypes,
    prepareItems : PropTypes.oneOfType([
        PropTypes.bool,///si la fonction permettant de faire un travail préparaoire des données de la liste sera appelée
        PropTypes.func,
    ]),
    items : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    responsive : PropTypes.bool,//si le nombre de columns de la big list sera déterminées dynamiquement
    //si la liste prendra en compte le redimessionnement de la page, ce qui poussera à mettre à jour le nombre de colonnes lorsque la liste est rédimensionnée
    bindResizeEvents : PropTypes.bool, 
    renderItem : PropTypes.func,
    containerProps : PropTypes.object,///les props du container à la big list
    filter : PropTypes.func, //la fonction utilisée pour le filtre des éléments à rendre pour la liste
    onMount : PropTypes.func,
    onUnmount : PropTypes.func,
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      minHeight : 300,
    },
    columnWrapperStyle : {
        flex : 1,
    }
  });
export default CommonListComponent;

CommonListComponent.displayName = "CommonListComponent";