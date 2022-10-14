import View from "$ecomponents/View";
import React from '$react'
 import {
   StyleSheet,
 } from 'react-native'
 import ScrollView  from "$ecomponents/ScrollView";
 import PropTypes from 'prop-types'
 import {isObj,defaultDecimal,defaultStr,isDecimal} from "$utils";
 import Label from "$ecomponents/Label";

 const DEFAULT_HEIGHT = 240;
 export const DEFAULT_COLUMN_WIDTH = 60;

 import { ROW_BORDER_COLOR,ROW_BORDER_WIDTH } from '../utils';


 const DatatableComponent = (props)=>{
    let {renderCell,cellContainerProps,hasFooters,footerContainerProps,showFilters,showFooter,footerCellContainerProps,headerCellContainerProps,renderFooterCell,rowContainerProps,containerProps,getRowKey,renderHeaderCell,data,columns,headerContainerProps,colsWidths,columnProps,columnsWidths,contentContainerStyle,renderRow} = props; 
    
    const hStyle = {borderBottomColor:ROW_BORDER_COLOR,borderBottomWidth:ROW_BORDER_WIDTH};
    const [state,setState] = React.useStateIfMounted({
        headers : [],
        footersCells : [],
        hasFooters : defaultBool(hasFooters),
        tableRows : []
    });
    const prevData = React.usePrevious(data);
    const prevColumns = React.usePrevious(columns);
    const prevShowFilters = React.usePrevious(showFilters);

    containerProps = defaultObj(containerProps);
    headerContainerProps = defaultObj(headerContainerProps);
    footerCellContainerProps = defaultObj(footerCellContainerProps);
    footerContainerProps = defaultObj(footerContainerProps);

    const prepareState = React.useCallback(()=>{
      const headers = [],footersCells = [],tableRows = [],cols = {};
      const widths = defaultObj(colsWidths,columnsWidths);
      getRowKey = typeof getRowKey =='function'? getRowKey : (r,index)=>index;
      columnProps = defaultObj(columnProps);
      let columnIndex = 0;
      cellContainerProps = defaultObj(cellContainerProps);
      headerCellContainerProps = defaultObj(headerCellContainerProps);
      let hasFooterFields = false;
      Object.map(columns,(columnDef,columnField)=>{
        if(!isObj(columnDef) || columnDef.visible === false) return;
        let {visible,width,type,...colProps} = columnDef;
        type = defaultStr(type,"text").toLowerCase().trim();
        colProps = defaultObj(colProps);
        width = defaultDecimal(widths[columnField],columnDef.width,DEFAULT_COLUMN_WIDTH);
        widths[columnField] = width;
        const style = {width};
        const colArgs = { width,Headers:headers,...colProps,containerProps:{},style,columnDef,columnField,columnIndex};
        let headerContent = typeof renderHeaderCell ==='function' ? renderHeaderCell (colArgs) : 
            defaultVal(columnDef.Label,columnDef.text);
        cols[columnField] = columnDef;
        columnIndex++;
        headers.push(
            <View {...headerCellContainerProps} {...colArgs.containerProps} key={columnField} style={[styles.headerItem,styles.headerItemOrCell,headerCellContainerProps.style,colArgs.containerProps.style,style]}>
                <Label>{headerContent}</Label>
          </View>
        )
        if(typeof renderFooterCell ==='function') {
          const footerProps = {...colArgs,containerProps:{}};
          const cellFooter = renderFooterCell(footerProps);
          const hsFooter = React.isValidElement(cellFooter);
          if(!hasFooterFields && hsFooter){
            hasFooterFields = hsFooter;
          }
          footersCells.push(<View key={columnField} style={[styles.headerItem,styles.headerItemOrCell,footerCellContainerProps.style,footerProps.containerProps.style,style]}>
            {hsFooter? cellFooter : null}
          </View>)
        };
      });
      const nState = {headers,footersCells,hasFooters}
      if(prevData !== data || prevColumns !== columns){
        const _renderCell = (args) => {
          const {rowIndex,columnField,rowData} = args;
          args.containerProps = defaultObj(args.containerProps);
          let style = {width: widths[columnField]};
          args.style = style;
          let ctx = rowData[columnField];
          if(typeof args.customRenderCell =='function'){
            ctx = args.customRenderCell(args);
          } else if(typeof renderCell ==='function'){
              ctx = renderCell(args);
          }
          if(typeof ctx =='number'){
              if(typeof columnDef.format ==='money'){
                  ctx = ctx.formatMoney();
              } else ctx = ctx.formatNumber();
          }
          return (
            <View {...cellContainerProps} {...args.containerProps} key={rowIndex+columnField} style={[styles.cell,styles.headerItemOrCell,cellContainerProps.style,args.containerProps.style, style]}>
              <Label>{ctx}</Label>
            </View>
          )
        }
        Object.map(data,(row,index,_index)=>{
          const key = getRowKey(row,index);
          if(!isObj(row) || (typeof key !=='string' && typeof key !=='number')) return;
          const rowIndex = typeof index ==='number'? index : _index;
          let rows = [];
    
          Object.map(cols,(columnDef,columnField)=>{
            rows.push(_renderCell({rowData:row,row,rowIndex,allData:data,index,rowKey:key,columns:cols,widths,containerProps:{},columnDef,columnField}));
          });
          const containerProps = typeof rowContainerProps =='function'? defaultObj(rowContainerProps({
            columns : cols,rowIndex,allData:data,rowData : row,row,rowKey:key,index,
          })) : isObj(rowContainerProps)? rowContainerProps : {};
          if((Array.isArray(rows) && rows.length === headers.length)){
              tableRows.push(
                  <View {...containerProps}  key={key} style={[containerProps.style,styles.row]}>
                      {rows}
                  </View>
              )
          } 
        });
        nState.tableRows = tableRows;
      }
      return nState;
    },[data,columns])
    React.useEffect(()=>{
      if(data === prevData && columns === prevColumns && prevShowFilters === showFilters) return;
      setState({...state,...prepareState()});
    },[data,columns,showFooter,showFilters])
    const {tableRows,headers,footersCells} = state;
    const hasFootersFields = state.hasFooters && showFooter && footersCells.length ? true : false;
     return (
        <ScrollView
            contentContainerStyle={[contentContainerStyle]}
            horizontal
            bounces={false} 
        >
          <View {...containerProps} style={[styles.container,containerProps.style]}>
            <View {...headerContainerProps} style={[headerContainerProps.style,!hasFootersFields ? hStyle:null,styles.header]}>
              {headers}
            </View>
            {hasFootersFields ? <View {...footerContainerProps} style={[footerContainerProps.style,hStyle,styles.header]}>
              {footersCells}
            </View> : null}
            <ScrollView
              vertical 
              bounces={false}
              style={styles.dataView}
              contentContainerStyle={styles.dataViewContent} >
              <View>
                  {tableRows}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      )

 }
 
 DatatableComponent.propTypes = {
     containerProps : PropTypes.object,
     renderHeaderCell : PropTypes.func,
     hasFooters : PropTypes.bool,
     renderRow : PropTypes.func,
     renderCell : PropTypes.func,
     renderFooterCell : PropTypes.func,///la fonction appelée pour le rendu des entêtes du footer
     footerCellContainerProps : PropTypes.object,
     footerContainerProps : PropTypes.object,
     showFooter : PropTypes.bool,
     cellContainerProps : PropTypes.object,
     headerCellContainerProps : PropTypes.object,//les props du container des entêtes du tableau
     rowContainerProps : PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
     ]),///les props du container des lignes
     columns: PropTypes.oneOfType([
         PropTypes.arrayOf(PropTypes.object),
         PropTypes.objectOf(PropTypes.object)
     ]).isRequired,
      columnWidth: PropTypes.number,
      data : PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.object),
        PropTypes.arrayOf(PropTypes.object)
      ]),
      height: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
      ]),
      headerContainerProps : PropTypes.object,
      rowContainerProps : PropTypes.oneOfType([
        PropTypes.func,  
        PropTypes.object
      ]),
      cellContainerProps : PropTypes.oneOfType([
        PropTypes.func,  
        PropTypes.object
      ]),
 }
 
 const styles = StyleSheet.create({
   container : {
     paddingRight :2,
   },
   header: {
     flexDirection: 'row',
     paddingVertical : 1,
     alignItems : 'center'
   },
   headerItemOrCell : {
    alignItems: 'flex-start',
    justifyContent: 'center',
    textAlign : 'left',
    //flex: 1,
    flexWrap : 'wrap',
    marginHorizontal : 7,
   },
   headerItem: {
     minHeight: 30,
   },
   dataView: {
     flexGrow: 1,
   },
   dataViewContent: {
     minHeight : '100%',
     paddingBottom : 30,
   },
   row: {
     flexDirection: 'row',
   },
   cell: {
     minHeight: 25,
   }
 });
 
 export default DatatableComponent;