import Avatar from "$ecomponents/Avatar";
import { StyleSheet,Pressable,Animated,View} from "react-native";
import {defaultObj,isObj,defaultStr,isFunction,defaultBool} from "$cutils";
import {getContentHeight} from "$ecomponents/BottomSheet";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import React from "$react";
import theme from "$theme"
import {isMobileNative} from "$cplatform";
import {styles as rStyles,getRowStyle} from "../utils";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useIsRowSelected,useDatagrid} from "../hooks";

const DatagridAccordionRow = React.forwardRef((props,ref)=>{
    const {
        selectable,
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
        numColumns,
        onToggleExpand,
        callArgs,
    } = props;
    const {context} = useDatagrid();
    let {wrapperStyle,title,right,rightProps,description,avatarContent,rowProps} = props;
    rightProps = defaultObj(rightProps);
    if(!isObj(item)) {
        return null;
    }
    const selected = useIsRowSelected(rowKey,rowIndex);
    const innerRef = React.useRef(null);
    const [expanded,setExpanded] = React.useState(false);
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

    let rowIndex = defaultDecimal(index);
    let rowIndexCount = index+1;
    const testID = defaultStr(props.testID,"RN_DatagridAccordionRow"+(rowKey||rowIndex))
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
    const viewWrapperStyle = [];
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
            viewWrapperStyle.push(styles.hasNotAvatar);
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
    const swipeableRef = React.useRef(null);
    return  <Pressable
                disabled = {selectable===false?true : false}
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
                    numColumns > 1 && styles.multiColumns,
                    selected && styles.selected,
                    //style,
                ]}
                ref = {React.useMergeRefs(ref,innerRef)}
        >
        <Swipeable
            ref = {swipeableRef}
            testID={testID+'_ContentContainerSwipeable'}
            friction={2}
            containerStyle = {{overflow:'hidden'}}
            leftThreshold={80}
            enableTrackpadTwoFingerGesture
            renderLeftActions={selectable === false? undefined : (_progress,dragX) => {
                const trans = dragX.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                });
                return (
                    <View style={{justifyContent:'center',flex:1}}>
                        <Animated.Text
                            style={[
                            styles.actionText,
                            {
                                transform: [{ translateX: trans }],
                                alignItems : 'center',
                                color : theme.colors.primary,
                            },
                            ]}>
                            {(selected?'Désélectionnez la ligne ':'Sélectionnez la ligne ')}
                    </Animated.Text>
                    </View>
                );
            }}
            onSwipeableWillOpen = {(direction)=>{
                if(selectable === false) return;
                if(swipeableRef.current && swipeableRef.current.close){
                    swipeableRef.current.close();
                }
                handleRowToggle();
            }}
        >
            <View 
                style={[styles.renderedContent,viewWrapperStyle]} 
                testID={testID+'_ContentContainer'}
            >
                {avatarContent}
                <View testID={testID+"_Content"} style={[styles.content,styles.wrap]}>
                    {title}
                    {description}
                </View>
                {right ? <Label testID={testID+"_Right"} primary selectable {...rightProps} style={[styles.right,styles.label,rStyles.lineHeight,rightProps.style]}>
                    {right}
                </Label> : null}
            </View>
        </Swipeable>
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
        paddingHorizontal : 5,
        width : "98%"
    },
    renderedContent : {
        flexDirection : 'row',
        alignItems : 'center',
        justifyContent : 'center',
        paddingVertical : 10,
    },
    right : {
        marginHorizontal : 0,
        paddingLeft:5,
        paddingRight : 0,
        paddingVertical : 5,
        fontSize:13,
        flexWrap: 'nowrap',
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
        paddingHorizontal : 0,
        marginHorizontal : 5,
        flexWrap : 'nowrap',
        justifyContent : 'center',
        width : '100%',
    },
    avatarContent : {
        marginRight : 5,
    },
    hasNotAvatar : {
        borderLeftWidth : 5,
        paddingLeft : 0,
        height : "100%"
    },
    selected : {
        paddingHorizontal : 0,
        paddingVertical : 0,
    },
});

DatagridAccordionRow.displayName = 'DatagridAccordionRow';