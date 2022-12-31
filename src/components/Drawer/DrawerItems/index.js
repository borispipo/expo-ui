import React from '$react';
import {isObj,isNonNullString} from "$utils";
import ExpandableItem from './ExpandableItem';
import DrawerItem from './DrawerItem';
import DrawerSection from "./DrawerSection"
import PropTypes from "prop-types";
import Divider from "$ecomponents/Divider";
import View from "$ecomponents/View";

export * from "./utils";

const DrawerItemsComponent = React.forwardRef((props,ref)=> {
  let {items:_items,minimized} = props;
  const hasAuth = typeof window.Auth !=='undefined' && Auth && Auth.isAllowedFromStr ? true : false;
  _items = typeof _items ==='function'? _items(props) : _items;
  if(React.isValidElement(_items)){
     return _items;
  }
  const r = React.useMemo(()=>{
    let items = []
    const renderExpandableOrSection = ({item,key,items})=>{
          if(hasAuth && isNonNullString(item.perm) && !Auth.isAllowedFromStr(item.perm)) return null;
          const {section,items:itx2,...rest} = item;
          if(section){
            return <DrawerSection 
                {...rest}
                minimized={minimized} 
                key={key}
            >
              {items}
            </DrawerSection>
          } else {
            return <ExpandableItem 
                {...rest}
                minimized={minimized} 
                key={key}
              >
                {items}
            </ExpandableItem>;
          }
    }
    Object.map(_items,(item,i)=>{
      if(React.isValidElement(item)){
         items.push(<React.Fragment key={i}>{item}</React.Fragment>)
      }
      if(typeof item ==='string' || typeof item =='number'){
         item = {label:item+''};
      } 
      if(!isObj(item)) return null;
      if(isObj(item.items) || Array.isArray(item.items)){
          const itx = []
          Object.map(item.items,(it,j)=>{
              if(!isObj(it)) return ;
              getDefaultProps(it);
              const r = renderItem({minimized,hasAuth,renderExpandableOrSection,items:item.items,item:it,key:i+j,props});
              if(r){
                itx.push(r);
              }
          });
          if(itx.length){
              const rr = renderExpandableOrSection({items:itx,key:i,item});
              if(rr){
                items.push(rr);
              }
          }
      } else {
          const r = renderItem({minimized,hasAuth,renderExpandableOrSection,items:_items,item,key:i+"",props});
          if(r){
            items.push(r);
          }
      }
    })
    return items;
  },[_items,minimized]);
  return <View ref={ref}>
      {r}
      <View style={{height:30}}></View>
  </View>
});


export default DrawerItemsComponent;

DrawerItemsComponent.displayName = "DrawerItemsComponent";

/*** les props des items du drawer */
const itemType = PropTypes.oneOfType([
   PropTypes.shape({
      label : PropTypes.string,
      section : PropTypes.bool, //si le drawer est de type section
      items : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object),
      ]),
      divider : PropTypes.bool,
   }),
   PropTypes.string,
   PropTypes.number,
   PropTypes.node,
])

DrawerItemsComponent.propTypes = {
  items : PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.arrayOf(itemType),
    PropTypes.objectOf(itemType),
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  minimized : PropTypes.bool,
}

const getDefaultProps = function(item){
  if(!isObj(item)) return null;
  item.label = defaultVal(item.label,item.text,item.accessibilityLabel);
  item.accessibilityLabel = defaultVal(item.accessibilityLabel,item.tooltip,item.label);
  item.title = defaultVal(item.title,item.label);
  return item;
}

const renderItem = ({item,minimized,hasAuth,renderExpandableOrSection,index,key})=>{
  key = key||index;
  if(React.isValidElement(item)){
    return <React.Fragment key={key}>
        {item}
    </React.Fragment>
  } else {
    if(hasAuth && isNonNullString(item.perm) && !Auth.isAllowedFromStr(item.perm)) return null;
    if(!item.label && !item.text && !item.icon) {
        if(item.divider === true){
          const {divider,...rest} = item;
          return (<Divider key={key} {...rest}/>)
      }
      return null;
    }
    item = getDefaultProps(item);
    if(isObj(item.items) || Array.isArray(item.items)){
       const itx = [];
       Object.map(item.items,(it,i)=>{
          if(!isObj(it)) return null;
          it = getDefaultProps(it);
          itx.push(<DrawerItem 
                {...it}  
                minimized = {minimized}
                key={key+i}
          
          />)
       })
       if(itx.length){
          return renderExpandableOrSection({items:itx,key,item})
       }
    } else {
       return <DrawerItem 
          minimized={minimized}  
          key={key} 
          {...item}
       />
    }
  }
}