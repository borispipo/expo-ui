import React from "$react";
import {StyleSheet} from "react-native";
import View from "$ecomponents/View";
import TabItems from "./TabItems";
import TabItem from "./TabItem";
import TabContent from "./TabContent";
import PropTypes from "prop-types";
import Session from "$session";
import {isNonNullString,defaultStr,defaultObj,defaultNumber,isObj,isNumber} from "$cutils";

let SessionObj = {};


export const setSessionActiveIndex  = (activeIndex,sessionName) => {
    if(!isNonNullString(sessionName)) return;
    SessionObj = defaultObj(Session.get("tabs"));
    SessionObj.activeTabs = defaultObj(SessionObj.actives)
    SessionObj.activeTabs[sessionName] = activeIndex; 
    Session.set('tabs',SessionObj);
}

export const getSessionActiveIndex = (props)=>{
    const {sessionName} = props;
    if(!isNonNullString(sessionName)) return 0;
    SessionObj = defaultObj(Session.get("tabs"));
    SessionObj.activeTabs = defaultObj(SessionObj.activeTabs)
    let activeIndex = defaultNumber(SessionObj.activeTabs[sessionName],0);
    if(isNumber(props.activeIndex)){
        activeIndex = props.activeIndex;
    }
    if(activeIndex > 0 && Array.isArray(props.children) && props.children.length){
        return activeIndex <= props.children.length - 1 ? activeIndex : 0;
    }
    return activeIndex;
}

const TabComponent = React.forwardRef((props,ref)=>{
    let {activeIndex:customActiveIndex,tabContentProps,withScrollView,testID,sessionName,children,onChange,tabItemProps,tabItemsProps,...rest} = props;
    let activeIndex = getSessionActiveIndex(props);
    rest = defaultObj(rest);
    tabItemsProps = defaultObj(tabItemsProps);
    tabItemProps = defaultObj(tabItemProps);
    tabContentProps = defaultObj(tabContentProps);

    const [index, setIndex] = React.useState(getSessionActiveIndex(props));
    const setActiveIndex = (nIndex)=>{
        setIndex(nIndex);
        setSessionActiveIndex(nIndex,sessionName);
        if(nIndex === index) return;
        if(onChange){
            onChange({activeIndex:nIndex,index:nIndex,sessionName,setActiveIndex});
        }
    }
    React.useEffect(()=>{
        activeIndex = getSessionActiveIndex(props);
        if(activeIndex !== index){
            setActiveIndex(activeIndex);
        } 
    },[children,activeIndex]);
    testID = defaultStr(testID,"RN_TabComponentComponent");
    const {tabs,contents,childrenProps} = React.useMemo(()=>{
        const tabs = [],contents = [],childrenProps=[];
        React.Children.map(children,(child,index)=>{
            if(!isObj(child)) return null;
            const {label,tabKey,children:childChildren,...rest} = isObj(child.props)?child.props:child;
            if(!React.isValidElement(label,true)) return null;
            let key = typeof tabKey =='string' && tabKey ? tabKey : typeof label =='string' && label ? label : index;
            key = key+index;
            tabs.push(<TabItem
                key = {key}
                label={label}
                {...tabItemProps}
                testID = {defaultStr(testID,tabItemProps.testID)+"_TabItem"}
            />);
            childrenProps.push(rest);
            contents.push(<React.Fragment key={key}>
                {childChildren}
            </React.Fragment>)
        })
        return {tabs,contents,childrenProps}
    },[children]);
    return <View {...rest} testID={testID} style={[styles.container,tabItemsProps.style]}>
        <TabItems testID={testID+"_TabItems"} {...tabItemsProps} activeIndex={index} style={[styles.tab,rest.style]} onChange={setActiveIndex}>
            {tabs}
        </TabItems>
        <TabContent testId={testID+"_TabContent"} withScrollView={withScrollView} {...tabContentProps} childrenProps={childrenProps} activeIndex={index} onChange={setActiveIndex} style={[styles.container,tabContentProps.style]}>
            {contents}
        </TabContent>
    </View>
})


TabComponent.propTypes = {
    activeIndex : PropTypes.number,
    onChange : PropTypes.func,
    tabItemsProps : PropTypes.object,//les props du tab
    tabItemProps : PropTypes.object,//les props des items du tab
    tabContentProps : PropTypes.object, ///les props de la tabContent
    sessionName : PropTypes.string,
}


export default TabComponent;

TabComponent.Item = (props)=>null;

const styles = StyleSheet.create({
    container : {
        minHeight : 300,
        flex : 1,
    },
})

TabComponent.displayName = "TabComponent";