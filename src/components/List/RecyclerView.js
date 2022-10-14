import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
//import PropTypes from "prop-types";
import CommonListComponent from "./Common";
import {defaultObj,defaultDecimal} from "$utils";
import React from "$react";
import Label from "$components/Label";
import {ActivityIndicator} from "react-native-paper";
import PropTypes from "prop-types";

export const ViewTypes = {
    FULL: 0,
    HALF_LEFT: 1,
    HALF_RIGHT: 2
};

const ListComponent =  React.forwardRef((props,ref)=>{
    let {getItemLayout,items,itemHeight,renderItem,rowRenderer,...rest} = props;
    rest = defaultObj(rest);
    const listRef = React.useRef(null);
    const [state,setState] = React.useState({
        dataProvider : new DataProvider((r1, r2) => {
            return r1 !== r2;
        }),
        layoutProvider : new LayoutProvider(
            index => {
                if (index % 3 === 0) {
                    return ViewTypes.FULL;
                } else if (index % 3 === 1) {
                    return ViewTypes.HALF_LEFT;
                } else {
                    return ViewTypes.HALF_RIGHT;
                }
            },
            (type, dim) => {
                if(typeof itemHeight =='number' && itemHeight) {
                    dim.height = itemHeight;
                }
            }
        ),
    });
    React.useEffect(()=>{
        setState({
            ...state,
            dataProvider : dataProvider.cloneWithRows(items)
        });
        console.log(dataProvider," is d provider hein",items)
    },[items])
    const {dataProvider,layoutProvider}  = state;
    return <>
        <CommonListComponent
            {...rest}
            items = {items}
            ref = {(el)=>{
                if(el){

                }
                React.setRef(listRef,el);
                React.setRef(ref,el);
            }}
            layoutProvider={layoutProvider} 
            dataProvider={dataProvider} 
            rowRenderer = {function(type,data,index){
                let ret = renderItem({item:data,type,index,isScrolling:listRef?.isScrolling?true:false,items:defaultArray(items)});
                console.log(ret," is result for ",data,index)
                return (React.isValidElement(ret,true)) ? <Label children={ret}/> : null; 
            }}
            Component = {RecyclerListView}
        />
    </>
})
ListComponent.prototypes = {
    ...defaultObj(RecyclerListView.propTypes),
    renderItem : PropTypes.func.isRequired,
    
}   

export default ListComponent;

ListComponent.propTypes = {
    ...CommonListComponent.propTypes
}

ListComponent.displayName = "RecyclerListViewComponent";