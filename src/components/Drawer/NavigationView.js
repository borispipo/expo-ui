import React from "$react";
import {StyleSheet } from "react-native";
import ScrollView  from "$ecomponents/ScrollView";
import DrawerItems from "./DrawerItems";
import {MINIMIZED_ICON_SIZE,ICON_SIZE, canBeMinimizedOrPermanent} from './utils';
import DrawerHeader from "./DrawerHeader";
import Icon from "$ecomponents/Icon";
import theme,{flattenStyle} from "$theme";
import {defaultObj} from "$utils";
import {isMobileNative} from "$cplatform";

const DrawerNavigationViewComponent = React.forwardRef((props,ref)=>{
    const {context,toggleIcon,toggleIconTooltip,header:customHeader,isPermanent,drawerItemsProps,drawerType,drawerItems,drawerRef,setState,toggleIconProps,isLeftPosition,drawerWidth,minimizable,headerProps,isMinimized,drawerItemsContainerProps,content,} = props;
    const header = React.isValidElement(customHeader)? customHeader : null;
    const [dRef] = React.useState({});
    React.setRef(ref,dRef);
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[])
    return <ScrollView {...drawerItemsContainerProps } 
            alwaysBounceVertical={false} 
            style={[styles.drawerContainer,drawerItemsContainerProps.style]}>
            {header || isMinimized && minimizable !== false ? <DrawerHeader
                {...headerProps}
                drawerWidth = {drawerWidth}
                minimized = {isMinimized}
                style = {[headerProps.style]}
                isLeftPosition = {isLeftPosition}
                    toggleButton = {<Icon 
                        {...toggleIconProps} 
                        size = {isMinimized ? MINIMIZED_ICON_SIZE: ICON_SIZE}
                        icon = {toggleIcon} 
                        title = {toggleIconTooltip}
                        style = {flattenStyle([{margin:0,marginHorizontal:0},toggleIconProps.style])}
                        onPress = {(e)=>{
                            ///si le drawer n'est pas visible alors on le rend visible
                            if(!isPermanent || !drawerRef.current.isOpen()){
                                return context.toggle();
                            }
                            /*** si le drawer est minimis?? */
                            if(isMinimized){
                                context.toggleMinimized(false);//on passe au mode non minimis??
                            } else if(minimizable !== false) {
                                return context.toggleMinimized(!isMinimized,{permanent:true});
                            }
                        }}
                        onLongPress = {(e)=>{
                            React.stopEventPropagation(e);
                            if(isMinimized || !canBeMinimizedOrPermanent()){
                            ///le long press n'a pas d'effet sur le drawer quand il est minimi??
                                return;
                            }
                            if(isPermanent){
                                return setState({permanent : false});
                            } else {
                            ///si le drawer est ?? temporaire, on le passe en mode permanent
                                return setState({permanent:true});
                            }
                        }}
                    />}
                > 
                {header}  
            </DrawerHeader> : null}
            {React.isValidElement(content)? content : 
                <DrawerItems
                    {...defaultObj(opts)}
                    drawerRef = {drawerRef}
                    {...defaultObj(drawerItemsProps)}
                    items = {drawerItems}
                    drawerType = {drawerType}
                    isDrawerOpen = {drawerRef.current?.isOpen() || false}
                    minimized = {isMinimized}
                />
            }
        </ScrollView>
});

DrawerNavigationViewComponent.displayName = 'DrawerNavigationViewComponent';

export default DrawerNavigationViewComponent;


const styles = StyleSheet.create({
    drawerContainer: {
      flex: 1,
      paddingTop : isMobileNative()? 25:0,
    },
  });