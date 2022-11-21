import Avatar from "$ecomponents/Avatar";
import { StyleSheet,Pressable,Animated,View} from "react-native";
import {defaultObj,isObj,defaultStr,isFunction,defaultBool} from "$utils";
import {getContentHeight} from "$ecomponents/BottomSheet";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import React from "$react";
import theme from "$theme"
import {styles as rStyles} from "../utils";
import {getSelectedBackgroundColor} from "../Actions/Header";
import Swipeable from 'react-native-gesture-handler/Swipeable';

const DatagridAccordionRow = React.forwardRef((props,ref)=>{
    const {selectable,rowKey,
        bottomSheetTitle:customBottomSheetTitle,
        bottomSheetTitlePrefix,
        previewProps:_previewProps,
        bottomSheetProps,
        onRowPress,
        avatarProps,
        onRowLongPress,
        context:pContext,item,
        index,
        isScrolling:_isScrolling,
        style,
        numColumns,
        itemHeight,
        onToggleExpand,
        callArgs,
        controlItemRender,
    } = props;
    let {wrapperStyle,title,right,rightProps,description,avatarContent,rowProps} = props;
    rightProps = defaultObj(rightProps);
    if(!isObj(item)) {
        return null;
    }
    const context = defaultObj(pContext);
    const isRowSelected = x => typeof context.isRowSelected === 'function'? context.isRowSelected(rowKey,rowIndex): false;
    const selected = isRowSelected();
    let isScrolling = defaultBool(_isScrolling)
    const innerRef = React.useRef(null);
    if(typeof context.isScrolling =='function'){
        let isS = context.isScrolling();
        if(typeof isS =='boolean'){
            isScrolling = isS;
        }
    }
    const [state,setState] = React.useStateIfMounted({
        expanded : false,
    });
    const toggleExpander = ()=>{
        if(onRowPress){
            onRowPress(callArgs);
        }
        if(!state.expanded){
            getContentHeight(innerRef,({height})=>{
                setState({...state,expanded:true});
                if(onToggleExpand){
                    const previewProps = defaultObj(_previewProps,bottomSheetProps);
                    let bottomSheetTitle = typeof customBottomSheetTitle =='function'? customBottomSheetTitle(callArgs) : customBottomSheetTitle;
                    const defTitle = isNonNullString(bottomSheetTitlePrefix)? ("Détails "+bottomSheetTitlePrefix.rtrim()+" "+rowIndexCount.formatNumber()):undefined;
                    bottomSheetTitle = defaultStr(bottomSheetTitle,defTitle,'Détails de la ligne N° '+rowIndexCount.formatNumber())
                    const previewTitle = isFunction(previewProps.title)? previewProps.title(callArgs) : defaultVal(previewProps.title,bottomSheetTitle);
                    return onToggleExpand({...previewProps,rowKey,item,index,height,title:previewTitle,onDismiss:()=>{
                        setState({...state,expanded:false});
                    }})
                }
            },10);
            return;
        } 
        setState({...state,expanded:!state.expanded});
    }

    let rowIndex = defaultDecimal(index);
    let rowIndexCount = index+1;
    const testID = defaultStr(props.testID,"RN_DatagridAccordionRow"+(rowKey||rowIndex))
    let _canHandleRow = isObj(context.props)? (!isFunction(context.props.filter)? true : context.props.filter(callArgs)):true;
    if(_canHandleRow ===false || _canHandleRow === null){
        //resetLayoutsRef();
        return null;
    }
    let _rP = {}
    const hasAvatar = React.isValidElement(avatarContent);
    const handleRowToggle = (event)=>{
        if(selectable === false) return;
        if(onRowLongPress){
            onRowLongPress(callArgs);
        }
        if(typeof context.handleRowToggle =='function'){
            return context.handleRowToggle({selected:!isRowSelected(),rowKey,rowData:item,item,row:item,rowIndex,index:rowIndex,cb:()=>{
                setState({...state})
            }});
        }
    }
    let viewWrapperStyle = {};
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
        ></Avatar> : null;/*<Pressable
            onPress={handleAvatarRowToggle}
            style = {{width:'100%'}}
            testID = {testID+"_HandleToggle"}
        />*/
        if(!hasAvatar){
            viewWrapperStyle = [styles.hasNotAvatar,{borderLeftColor:theme.colors.primaryOnSurface}]
        }
    }

    if(state.expanded){
        if(React.isValidElement(avatarContent) && hasAvatar){
            avatarContent = <Avatar 
                {...avatarProps}
                suffix={rowIndex}  
                icon = {"information-outline"}
            ></Avatar>
        }
    } else if(selectable === false){
        _rP.disabled = true;
    } 
    if(!React.isValidElement(avatarContent)){
        avatarContent = null;
    }    
    right = typeof right === 'function'? right ({color:theme.colors.primaryOnSurface,selectable:true,style:[rStyles.lineHeight,styles.right]}) : right;
    const renderLeftActions = (_progress,dragX) => {
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
    };
    const swipeableRef = React.useRef(null);
    return  <Pressable
                {..._rP}    
                {...rowProps}
                testID={testID}
                children = {null}
                onPress = {toggleExpander}
                onLongPress={handleRowToggle}
                style = {[
                    _rP.style,rowProps.style,
                    styles.container,
                    numColumns > 1 && {width:'99%'},
                    selected && styles.containerSelected,
                    styles.bordered,
                    wrapperStyle,
                    style,
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
                    renderLeftActions={selectable === false? undefined : renderLeftActions}
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
                        {avatarContent ? <View testID={testID+"_AvatarContainer"} style={[styles.avatarContent]}>
                            {avatarContent}
                        </View> : null}
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
    },
    renderedContent : {
        flexDirection : 'row',
        alignItems : 'center',
        justifyContent : 'center'
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
        marginVertical : 10,
        paddingVertical : 5,
        paddingHorizontal : 15,
        marginHorizontal : 5,
        flexWrap : 'nowrap',
        justifyContent : 'center',
        width : '100%',
    },
    containerSelected : {
        paddingLeft : 2,
    },
    avatarContent : {
        marginRight : 5,
    },
    hasNotAvatar : {
        borderLeftWidth : 5,
        paddingLeft : 2,
        height : "100%"
    }
});

DatagridAccordionRow.displayName = 'DatagridAccordionRow';