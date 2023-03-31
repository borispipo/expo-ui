import Icon from "$ecomponents/Icon";
import {defaultObj,isPlainObject,} from "$cutils";
import React from "$react";
import {Pressable,StyleSheet} from "react-native";
import PropTypes from "prop-types";
import { renderItems } from "./utils";

export * from "./utils";


import Item from "./Item";
import Menu from "./Menu";

export {Item};


/****
 * @voir : https://callstack.github.io/react-native-paper/menu.html;
 * @param anchorProps a deux type de valuers : lorsque anchor n'est pas un élément réact valide, il s'agit des props du composant Icon de react-native-paper
 *        lorsque anchror est un element réact valide, il s'agit des props du composant TouchableOpacity de react-native
 *      si closeOnPress est différent de false, alors le menu sera fermé lorsqu'on clique sur un item
 *      anchorProps peut être de la forme : {
 *          Component {default : Icon}  qui est le composant qui sera rendu
 *      }
 *      is anchor est un objet plain alors anchorProps = {...anchorProps,...anchor};
 */
const MenuComponent = React.forwardRef((props,ref)=>{
    let {items,onOpen,children,onAnchorPress,onClose,testID,onPressItem,filter,anchor,anchorProps,itemProps,renderItem,closeOnPressItem,...menuProps} = props;
    anchorProps = defaultObj(anchorProps);
    testID = defaultStr(testID,"RN_MenuComponent");
    anchorProps.testID = defaultStr(anchorProps.testID,testID+"_Anchor");
    menuProps = defaultObj(menuProps);
    const [visible, setVisible] = React.useState(false);
    const prevSibible = React.usePrevious(visible);
    const openMenu = (event,callback) => {
        if(callback === true && typeof onAnchorPress ==='function' && onAnchorPress(event) ===false){
            return;
        }
        if(prevSibible === visible && visible) return;
        setVisible(true);
        if(typeof onOpen =="function"){
            onOpen({});
        }
    };
    const closeMenu = () => {
        setVisible(false);
        if(typeof onClose =="function"){
            onClose({});
        }
    };
    const onPress = (e)=>{
        if(typeof anchorProps.onPress =='function' && anchorProps.onPress(e) === false) return;
        openMenu(e,true);
    }
    if(typeof anchor =='function'){
        anchor = anchor({onPress:openMenu});
    } else if(React.isValidElement(anchor)){
        anchor = <Pressable {...anchorProps} onPress={onPress}>{anchor}</Pressable>
    } else if(React.isComponent(anchor)){
        const A = anchor;
        anchor = <A 
            {...anchorProps}
            onPress={onPress}
        />
    } else {
        if(isPlainObject(anchor)){
            anchorProps = {...anchorProps,...anchor};
        } 
        const Component = React.isComponent(anchorProps.Component)?anchorProps.Component : Icon;
        anchor = <Component {...anchorProps}  onPress = {onPress}/>
    }
    if(!anchor){
        console.error("unable to render menu, anchor not spécified for props",props);
    }
    const context = {openMenu,closeMenu,open:openMenu,close:closeMenu};
    //React.setRef(ref,context);
    if(typeof children =='function'){
        children = children({openMenu,closeMenu,context});
    }
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[]);
    return  <Menu {...menuProps} ref={(el)=>{
        if(el){
            for(let i in context){
                if(!(i in el)){
                    el[i] = context[i];
                }
            }
        }
        React.setRef(ref,el);
    }} testID={testID} visible={visible} onDismiss={closeMenu} anchor={anchor}>
        {renderItems({...props,onPressItem,renderItem,openMenu,closeMenu})}
        {React.isValidElement(children)? children: null}
    </Menu>
});
export default MenuComponent;
MenuComponent.displayName = "MenuComponent";

MenuComponent.propTypes = {
    onAnchorPress : PropTypes.func,
    anchor : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.element,
        PropTypes.node,
    ]),
    children : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]),
    items : PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
    ]),
    filter : PropTypes.func,
    itemProps : PropTypes.shape({
        closeOnPress : PropTypes.bool, //si le menu sera fermé lorsqu'on cliquera sur l'item props
    }),
    onOpen : PropTypes.func,
    onClose : PropTypes.func,
    onPressItem : PropTypes.func,
    closeOnPressItem : PropTypes.bool, ///si le menu sera fermé lorsqu'on clique sur un item
}

MenuComponent.Item = Item;