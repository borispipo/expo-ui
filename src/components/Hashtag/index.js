import {isNonNullString,defaultObj} from "$cutils";
import {open as showPreloader,close as hidePreloader} from "$epreloader";
import Label from "$ecomponents/Label";
import templates from "$ecomponents/Form/Fields/sprintfSelectors";
import Tooltip from "$ecomponents/Tooltip";
import { Pressable } from "react-native";
import React from "$react";

/*** 
 * API The component ReactHashtag is actually pretty generic. Is not something that someone can't do in half an hour. But, this one has some generic API that could make you turn.
    Name	Type	Description
    renderHashtag(value: String, onPress: Function)	function	Returns the custom element to be renderer instead of a <span>. You can go wild here.
    onHashtagPress(value: String, e: Event)	function	The click handler for each hashtags. This will be called with the hashtag value that got clicked
 *  
 * 
 */
const rule = /([#|＃][^\s]+)/g;
const parse = (value, renderer,props) => {
    if(!isNonNullString(value)){
        return React.isValidElement(value)? value: null;
    }
    return value.split(rule).map((chunk,i) => {
        if (chunk.match(rule)) {
            return renderer(chunk,props);
        }
        return <Label {...props} key={i}>{chunk}</Label>
    });
};
const onHashtagPress = ({dbName,code,table})=>{
    if(isNonNullString(table) && isNonNullString(code)){
        code = code.toUpperCase().trim()
        const run = (cb)=>{
            if(!isNonNullString(dbName)){
                cb(dbName);
            } else if(false) {
                dbName = dataFileManager.sanitizeName(dbName,table);
                table = table.toUpperCase();
                let hasFound = false;
                let user = defaultObj(Auth.getLoggedUser());
                dataFileManager.getAll((dF,code)=>{
                    if(dF.code == dbName){
                        if(dF.type !== 'seller' || (dF.type == 'seller' && arrayValueExists(dF.users,user.code))){
                            hasFound = true;
                        }
                    }
                });
                if(hasFound){
                    cb(dbName)
                }
            }
        }
        run((dbName)=>{
            showPreloader("traitement de la requête ...");
        })
    }
}

const defaultRenderText = ({text,code,value,dbName,table,hashtag})=>{
    let title = "";
    text = defaultStr(text);
    if(code){
        title +=( (title)? "\n":"") +" Code : [" + code+"]";
    }
    if(isNonNullString(table)){
        title +=( (title)? "\n":"") +" Table : [" + table.toUpperCase()+"]";
    }
    if(dbName){
        //title +=( (title)? "\n":"") + dataFileManager.dataFileText +" : ["+dbName+"]";
    }
    return <Tooltip Component={Label} cursorPointer primary style={[{textDecorationLine:'underline'}]} title={title}>
        {"#"+text}
    </Tooltip>
}
const defaultHashtagRenderer = x => (hashtag,hasTagProps) =>{
    const {Component:CustomComponent,renderText,...props} = defaultObj(hasTagProps);
    if(!isNonNullString(hashtag)) return null;
    let val = hashtag;
    if(!isNonNullString(val)) return;
    let split = val.split("#");
    let dbName = '';
    let code = "";
    let table = ""
    if(split[1]){
        dbName = split[1].trim().split("[")[0];
        val = split[1].trim();
        split=val.match(/\[([^)]+)\]/);
        if(split && split[1] && val.indexOf("-")){
            val = split[1];
            let index = val.indexOf('-');
            table = val.substring(0,index);
            code = val.substring(index+1,val.length);
            let ob = defaultObj(templates["&"+table.toLowerCase().trim().ltrim("&").rtrim("&")+"&"])
            table = defaultStr(ob.table,table);
        }
    }
    const p = {...props,table,value:code||hashtag,code,dbName,text:code||hashtag,hashtag};
    const text = typeof renderText =="function"? renderText(p) : defaultRenderText(p);
    if(!React.isValidElement(text,true)) return null;
    let Component = React.isComponent(Component) ? Component : Pressable;
    props.style = [{textDecorationLine : 'underline'},props.style]
    return <Component key={hashtag} {...defaultObj(props)} onPress={(e)=>{
        React.stopEventPropagation(e);
        if(props.disabled) return;
        onHashtagPress({...p,event:e});
    }}>{text}</Component>
}

const HashTagComponent = props => {
    const contents =
      typeof props.children === "object" && props.children && props.children.length
        ? !isNaN(props.children.length)
          ? props.children[0]
          : props.children
        : props.children;
    const hashtagRenderer = props.renderHashtag || defaultHashtagRenderer();
    return parse(contents, hashtagRenderer,props);
}

export default HashTagComponent;