import {Content} from "$ecomponents/BottomSheet";
import Icon from "$ecomponents/Icon";
import React from "$react";
import {defaultStr,defaultBool,defaultObj} from "$utils";
import Filter, {canHandleFilter,getFilterStateValues} from "$ecomponents/Filter";
import PropTypes from "prop-types";
import { StyleSheet,View } from "react-native";
import Menu from "$ecomponents/Menu";
import Label from "$ecomponents/Label";
import theme from "$theme"
import Expandable from "$ecomponents/Expandable";
import { Dimensions } from "react-native";
import Grid from "$components/Grid";
import { Pressable } from "react-native";
import Tooltip from "$ecomponents/Tooltip";

const MIN_WIDTH = 250;
let windowWidth = Dimensions.get("window").width;

const FiltersAccordionComponent = React.forwardRef((props,ref)=>{
    const {filters,isLoading,filteredColumns,children,label,filterTitle:customFilterTitle,visible:customVisible,orOperator,andOperator,onToggleFilters,context:customContext,...restProps} = props;
    const context = defaultObj(customContext);
    const [state,setState] = React.useState({
        visible : defaultBool(customVisible,false),
        visibleColumns : defaultObj(filteredColumns),
    });
    const valuesRefs = React.useRef({});
    windowWidth = Dimensions.get("window").width;
    const innerRef = React.useRef(null);
    const {visible,visibleColumns} = state;
    const rest = defaultObj(restProps);
    const filterTitle = defaultStr(customFilterTitle,'Filtres');
    const canHandlerFilterRef = React.useRef(0);
    const filteredRef = React.useRef({});
    const cellProps = {
        desktopSize : 4,
        tabletSize :6,
        phoneSize : 12, 
        style : [theme.styles.ph1],
    }
    const prepareContent = (filters,renderMenusOnly)=>{
        const content = []
        const colMenus = [];
        let mainFilterTitle = defaultStr(filterTitle);
        let counter = 0;
        const containerProps = {
            style : [styles.filter,{minWidth : Math.min(windowWidth,MIN_WIDTH)}]
        };
        Object.map(filters,(filter,index)=>{
            if(React.isValidElement(filter)){
                content.push(<Grid.Cell {...cellProps} key={index}>{filter}</Grid.Cell>)
            } else if(isObj(filter)){ 
                const {onChange} = filter;
                const key = defaultStr(filter.key,filter.field,filter.index,index+"");
                const visible = !!visibleColumns[key];
                colMenus.push(<Menu.Item
                    key = {key}
                    {...filter}
                    icon = {visible ? "check" : null}
                    onPress = {(e)=>{
                        if(context.toggleFilterColumnVisibility){
                            context.toggleFilterColumnVisibility(key,!visible);
                        }
                        setState({...state,visibleColumns:{...visibleColumns,[key]:!visible}})
                    }}
                />)
                if(!visible) {
                    return null;
                }
                mainFilterTitle +=(counter?",":" :\n")+defaultStr(filter.label,filter.text,filter.field)//+" : "+defVal+""
                counter++;
                if(renderMenusOnly) return null;
                content.push(
                    <Grid.Cell {...cellProps} key={key}>
                    <Filter
                        {...filter}
                        {...(isObj(valuesRefs.current[key]) ? valuesRefs.current[key] : {})}
                        dynamicRendered
                        isLoading = {isLoading && filteredRef.current[key] ? true : false}
                        orOperator = {defaultBool(orOperator,filter.orOperator,true)}
                        andOperator = {defaultBool(andOperator,filter.andOperator,true)}
                        onChange = {(arg)=>{
                            if(!arg.action && !arg.operator || !arg.field) return;
                            const canHandle = canHandleFilter(arg);
                            valuesRefs.current[key] = arg;
                            if(filteredRef.current[key] !== canHandle){
                                if(canHandle){
                                    canHandlerFilterRef.current++;
                                } else {
                                    canHandlerFilterRef.current = Math.max(0,canHandlerFilterRef.current-1);
                                }
                            }
                            filteredRef.current[key] = canHandle;
                            if(onChange){
                                onChange(arg);
                            }
                        }}
                        withBottomSheet
                        containerProps = {{...containerProps}}
                        inputProps = {{containerProps}}
                    /></Grid.Cell>)
            }
        })
        return {content,mainFilterTitle,colMenus}
    }
    if(typeof children ==='function'){
        const ct = children({});
        return React.isValidElement(ct)? ct : null;
    }
    const {mainFilterTitle} = prepareContent(filters,true);
    const hasFilters = canHandlerFilterRef.current > 0 ? true : false;
    return <Content
        animateOnClose
        {...rest}
        title = {null}
        visible = {visible}
        onDissmiss = {()=>{
            setState({...state,visible:false})
        }}
        anchor = {(props)=><Tooltip title = {mainFilterTitle}Component={Pressable} {...props} style={[theme.styles.row]}>
             <Icon 
                name={hasFilters?"filter-menu":"filter-plus"} 
                {...props}
                color = {hasFilters?theme.colors.primaryOnSurface:undefined}
            />
            {React.isValidElement(label,true)?<Label  style={[hasFilters && {color:theme.colors.primaryOnSurface}]} fontSize={16} textBold>{label}</Label>:null}
        </Tooltip>}
        ref = {(el)=>{
            innerRef.current = el;
            React.setRef(ref,el);
        }}
    >
         {({open,close})=>{
            const {content,colMenus} = prepareContent(filters);
            return <View style={[styles.wrapper]}>
                <View style = {[styles.menuWrapper]}>
                    <Expandable
                        left = {(props)=><Icon {...props} icon={content.length?'filter-plus':'filter-menu'}/>}
                        style = {styles.expandable}
                        title = {<Label>{filterTitle}</Label>}
                    >
                        <View style={[styles.menuContent]}>
                            {colMenus}
                        </View>
                    </Expandable>
                </View>
                {content.length ? <View style={[theme.styles.w100]}>
                    <Grid style={theme.styles.w100}>
                        {content}
                    </Grid>
                </View> : null}
            </View>
         }}
    </Content>
})

FiltersAccordionComponent.propTypes = {
    onToggleFilters : PropTypes.func,
}

export default FiltersAccordionComponent;

const styles = StyleSheet.create({
    wrapper : {
        flex : 1,
        width :'100%'
    },
    menuWrapper : {
        //justifyContent : 'center',
        //alignItems : 'flex-start',
        paddingHorizontal : 10
    },
    expandable1 : {
        flex : 1,
    },
    menuContent : {
        marginBottom : 10
    },
    contentContainer : {
        flexGrow : 0,
        position : 'relative'
    },
    content : {
        position : 'relative',
        flex : 1,
        flexDirection:'row',
        flexWrap : 'wrap',
        paddingHorizontal:15,
        flexGrow : 0,
    },
    filter : { 
        marginRight : 10,
    },
});

FiltersAccordionComponent.displayName = "FiltersAccordionComponent";