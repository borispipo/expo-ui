import Avatar from "$ecomponents/Avatar";
import { StyleSheet,Pressable,Animated,View} from "react-native";
import {defaultObj,isObj,defaultStr,isFunction,defaultBool} from "$cutils";
import {getContentHeight} from "$ecomponents/BottomSheet";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import React from "$react";
import theme from "$theme"
import {styles as rStyles,getRowStyle} from "../utils";
import { useIsRowSelected,useDatagrid} from "../hooks";
import {HStack} from "$ecomponents/Stack";
import { isMobileNative, isReactNativeWebview} from "$cplatform";

const isNative = isMobileNative() || isReactNativeWebview();

const DatagridAccordionRow = React.forwardRef(({selectable,
        rowKey,
        bottomSheetTitle:customBottomSheetTitle,
        bottomSheetTitlePrefix,
        previewProps:_previewProps,
        bottomSheetProps,
        onRowPress,
        avatarProps,
        onRowLongPress,
        item,
        index,
        style,
        contentContainerProps,
        numColumns,
        onToggleExpand,
        callArgs,
        title,
        right,
        rightProps,
        description,
        avatarContent,
        rowProps,
        testID,
        ...restProps},ref)=>{
    const {context} = useDatagrid();
    rowProps = defaultObj(rowProps);
    rightProps = defaultObj(rightProps);
    contentContainerProps = defaultObj(contentContainerProps);
    let rowIndex = defaultDecimal(index);
    let rowIndexCount = index+1;
    const selected = useIsRowSelected(rowKey,rowIndex);
    const innerRef = React.useRef(null);
    const [expanded,setExpanded] = React.useState(false);
    if(!isObj(item)) {
        return null;
    }
    const toggleExpander = ()=>{
        if(onRowPress){
            onRowPress(callArgs);
        }
        if(!expanded){
            getContentHeight(innerRef,({height})=>{
                setExpanded(true);
                if(onToggleExpand){
                    const previewProps = defaultObj(_previewProps,bottomSheetProps);
                    let bottomSheetTitle = typeof customBottomSheetTitle =='function'? customBottomSheetTitle(callArgs) : customBottomSheetTitle;
                    const defTitle = isNonNullString(bottomSheetTitlePrefix)? ("Détails "+bottomSheetTitlePrefix.rtrim()+" "+rowIndexCount.formatNumber()):undefined;
                    bottomSheetTitle = defaultStr(bottomSheetTitle,defTitle,'Détails de la ligne N° '+rowIndexCount.formatNumber())
                    const previewTitle = isFunction(previewProps.title)? previewProps.title(callArgs) : defaultVal(previewProps.title,bottomSheetTitle);
                    return onToggleExpand({...previewProps,rowKey,item,index,height,title:previewTitle,onDismiss:()=>{
                        setExpanded(false);
                    }})
                }
            },10);
            return;
        } 
        setExpanded(!expanded);
    }
    testID = defaultStr(testID,"RN_DatagridAccordionRow"+(rowKey||rowIndex))
    const hasAvatar = React.isValidElement(avatarContent);
    const handleRowToggle = (event)=>{
        if(selectable === false) return;
        if(onRowLongPress){
            onRowLongPress(callArgs);
        }
        return !!context.handleRowToggle({rowKey,rowData:item,item,row:item,rowIndex,index:rowIndex});
    }
    const wrapStyle = React.useMemo(()=>{
        return getRowStyle({row:item,index,selected,numColumns,isAccordion:true,rowIndex:index});
    },[selected,numColumns]);
    const viewWrapperStyle = [selectable !== false && theme.styles.cursorPointer,hasAvatar ? styles.hasAvatar : styles.hasNotAvatar];
    if(selected) {
        const handleAvatarRowToggle = (event)=>{
            React.stopEventPropagation(event);
            handleRowToggle(event);
            return false;
        };
        const sTtitle = "Cliquez pour désélectionner la ligne N° "+rowIndexCount.formatNumber();
        avatarContent = hasAvatar ? <Avatar 
            {...avatarProps}
            suffix={rowIndex}  
            testID = {testID+"_Avatar"}
            onPress = {handleAvatarRowToggle}
            icon = {"check"}
            title = {sTtitle}
        ></Avatar> : null;
        if(!hasAvatar){
            viewWrapperStyle.push({borderLeftColor:theme.colors.primaryOnSurface})
        }
    }

    if(expanded){
        if(React.isValidElement(avatarContent) && hasAvatar){
            avatarContent = <Avatar 
                {...avatarProps}
                suffix={rowIndex}  
                icon = {"information-outline"}
            ></Avatar>
        }
    } 
    right = typeof right === 'function'? right ({color:theme.colors.primaryOnSurface,selectable:true,style:[rStyles.lineHeight,styles.right]}) : right;
    return  <Pressable
                disabled = {selectable===false?true : false}
                {...restProps}
                {...rowProps}
                testID={testID}
                children = {null}
                onPress = {toggleExpander}
                onLongPress={handleRowToggle}
                style = {[
                    styles.container,
                    styles.bordered,
                    wrapStyle,
                    rowProps.style,
                    style,
                    numColumns > 1 && styles.multiColumns,
                    selected && styles.selected,
                    selectable !== false && theme.styles.cursorPointer,
                ]}
                ref = {(el)=>{
                    if(el){
                        el.toggleExpand = (expand)=>{
                            setExpanded(typeof expand =='boolean'? expand : !expanded);
                        }
                    }
                    React.setRef(ref,el);
                    React.setRef(innerRef,el);
                }}
        >
        <HStack 
            testID={testID+'_ContentContainer'}
            {...contentContainerProps}
            style={[styles.renderedContent,!hasAvatar && styles.renderedContentHasNotAvatar,viewWrapperStyle,!hasAvatar && styles.contentContainerNotAvatar,contentContainerProps.style]} 
        >
            {hasAvatar?<View testID={testID+"_AvatarContentContainer"} style={[styles.avatarContent]}>
                {avatarContent}
            </View> : avatarContent}
            <View testID={testID+"_Content"} style={[styles.content,styles.wrap]}>
                {title}
                {description}
            </View>
            {right && React.isValidElement(right,true) ? <Label testID={testID+"_Right"} primary  {...rightProps} style={[{userSelect:selectable?"all":"none"},styles.right,styles.label,rStyles.lineHeight,rightProps.style]}>
                {right}
            </Label> : null}
        </HStack>
    </Pressable>
})

export default DatagridAccordionRow;

DatagridAccordionRow.propTypes  = {
    callArgs : PropTypes.object,///les options utilisées pour toutes les fonctions nécessaire pour le rendu du DatagridAccordionRow
    /*** permet de récupérer le titre à appliquer au bottomSheet pour afficher les détails de la ligne */
    bottomSheetTitle : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    onLayout : PropTypes.func,
    onRowPress : PropTypes.func,
    onRowLongPress : PropTypes.func,
    onToggleExpand : PropTypes.func,
    /***** la fonction accordion doit retourner un objet shape de la forme : 
     * {
     *    title : PropType.node, le texte primaire à afficher
     *    right : PropType.node, le texte primaire droit
     *    description : PropType.node, le texte secondaire
     *    secondaryTextRight : PropType.node, le texte secondaire droit
     *    avatar : PropType.oneOfType([
     *        PropType.string : string,url, dataUrl,
     *        PropType.node
     *    ])
     *    content : PropType.node,
     * }
     */
    accordion : PropTypes.func 
}

const styles = StyleSheet.create({
    wrap : {
        flexShrink: 1,flexGrow: 1
    },
    h100 : {
        height : '90%'
    },
    bordered : {
        //borderColor: "#ced4da",
        //borderWidth : 1,
        //paddingHorizontal:10,
    },
    multiColumns : {
        width : "98%"
    },
    renderedContent : {
        alignItems : 'center',
        justifyContent : 'flex-start',
        paddingVertical : 2,
        paddingHorizontal : 0,
        paddingRight : 10,
        width : "100%",
        flexWrap : "nowrap"
    },
    renderedContentHasNotAvatar : {
        justifyContent : "space-between",
    },
    right : {
        marginHorizontal : 0,
        paddingLeft:0,
        paddingRight : 0,
        paddingVertical : 5,
        fontSize:13,
        flexWrap: 'nowrap',
        textAlign : "right",
        alignSelf : "right",
    },
    row : {
        flexDirection:'row',
        justifyContent : 'space-between',
        alignItems : 'center'
    },
    label : {
        alignSelf : 'flex-start',
    },
    container : {
        paddingVertical : 0,
        paddingLeft : isNative ? 7 : 2,
        //paddingHorizontal : 7,
        paddingRight : 7,
        marginHorizontal : 0,
        flexWrap : 'nowrap',
        justifyContent : 'center',
        width : '100%',
        minHeight : 60,
    },
    avatarContent : {
        marginRight : 10,
    },
    hasNotAvatar : {
        borderLeftWidth : 7,
        paddingLeft : 0,
        height : "100%",
        borderLeftColor : "transparent",
    },
    hasAvatar : {
        paddingLeft : isNative ? 10 : 7,
    },
    selected : {
        //paddingHorizontal : 0,
        //paddingVertical : 0,
    },
    contentContainerNotAvatar : {
        paddingLeft : 2,
    },
    content : {
        maxWidth : "80%",
    },
});

DatagridAccordionRow.displayName = 'DatagridAccordionRow';