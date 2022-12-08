import {defaultStr,isNonNullString} from "$utils";
import React from "$react";
import CountUp from "$ecomponents/CountUp";
import Avatar from "$ecomponents/Avatar";
import { ActivityIndicator } from "react-native-paper";
import Item from "$ecomponents/Expandable/Item";
import {navigateToTableDataList} from "$enavigation/utils";
import theme from "$theme";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import APP from "$capp/instance"
import cActions from "$cactions";
import {View} from "react-native";

export default function DatabaseStatisticContainer (props){
    const [state,setState] = React.useState({
        isLoading : true,
        count : 0,
    });
    let {table,fetchCount,index,testID,title,icon,onPress} = props;
    title = defaultStr(title)
    table = defaultObj(table);
    const tableName = defaultStr(table.tableName,table.table).toUpperCase();
    fetchCount = typeof table.fetchCount =='function'? table.fetchCount : typeof fetchCount =='function'? fetchCount : undefined;
    if(!fetchCount || !tableName) return null;
    const refreshingRef = React.useRef(null);
    const isMounted = React.useIsMounted();
    const refresh = ()=>{
        if(refreshingRef.current || !isMounted()) return;
        refreshingRef.current = true;
        setTimeout(()=>{
           fetchCount().then((count)=>{
                setState({...state,isLoading:false,count});
                refreshingRef.current = false;
            }).catch((e)=>{
                setState({
                    isLoading : false, count : 0,
                });
                refreshingRef.current = false;
            });
        },100);
    }

    React.useEffect(()=>{
        APP.on(cActions.upsert(tableName),refresh);
        APP.on(cActions.remove(tableName),refresh);
        refresh();
        return ()=>{
            APP.off(cActions.upsert(tableName),refresh);
            APP.off(cActions.remove(tableName),refresh);
        }
    },[]);
    React.useEffect(()=>{
        //refresh();
    },[props])
    const {isLoading,count} = state;
    return <Item
        testID = {defaultStr(testID,"RN_DatabaseStatistic_"+table)}
        onPress = {(args)=>{
            if(onPress && onPress(args) === false) return;
            navigateToTableDataList(tableName,{
                tableName
            })
        }}
        left = {(aProps)=>{
            return <Avatar suffix={index} {...aProps} icon= {icon} size={40} label={title}/>
        }}
        //right = {(rP)=><Icon {...rP} name='refresh' onPress={refresh}/>}
        title = {<Label splitText numberOfLines={1} primary style={[{fontSize:15}]}>{title}</Label>}
        titleProps = {{primary : true}}
        description = {isLoading?<View style={[theme.styles.justifyContentFlexStart,theme.styles.alignItemsFlexStart]}>
            <ActivityIndicator color={theme.colors.primary}/>
        </View>:<CountUp 
            from={0} 
            to={count}
            style = {{fontSize:20,color:theme.colors.secondaryOnSurface}}
        />}
    >

    </Item>
}

/*** DBSTAT, prend en paramètre le nom de la bd ainsi que celui de la table et affiche en statistic,: 
 *  Le nombre d'éléments crées en bases ainsi que ceux actifs
 */
 DatabaseStatisticContainer.propTypes = {
    ...Item.propTypes,
    /*** La méthode fetchCount doit retourner une promèsse qui lorsqu'elle est résolue, résoue le nombre d'éléments de la table de données en bd */
    fetchCount : PropTypes.func,//la fonction permettant de counter les éléments de la table data
    table : PropTypes.shape({
        table : PropTypes.string,
        tableName : PropTypes.string,
        fetchCount : PropTypes.func,//la fonction permettant de counter les éléments de la table data
    }).isRequired,
    title : PropTypes.string, //le titre à afficher
}