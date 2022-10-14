/**** see : https://github.com/danilowoz/react-content-loader */
import {defaultObj} from "$utils";
import View from "$ecomponents/View";
import {StyleSheet,Dimensions,useWindowDimensions} from "react-native";
import React from "react";
import ContentLoaderF, {Facebook as CLFacebook,Instagram as CLInstagram} from './Loader';
import PropTypes from "prop-types";
import BarcharComponent from "./BarChar";
import PieChartComponent from "./PieChart";
import FormComponent,{HEIGHT as formHeight} from "./Form";
import DatagridContentLoader,{HEIGHT as datagridHeight} from "./Datagrid";
import ProfileComponent from "./Profile";
import { getBackgroundColor } from "./utils";
import TaskListComponent from "./TaskList";
import theme,{Colors} from "$theme"
import Rect from "./Rect";
import Circle from "./Circle";

export * from "./utils";

export {Rect};

export {Circle};

export {default as Table} from "./Table";


export default function ContentLoaderWrapper (props){
    let {instance,containerProps,mediaQueryUpdateNativeProps,instances,Component,count,...rest} = props;
    const innerRef = React.useRef(null);
    Component = defaultVal(Component,ContentLoaderF);
    containerProps = defaultObj(containerProps);
    const getChildren = ({width,height,count})=>{
        const dimensions = Dimensions.get("window");
        width = width || dimensions.width;
        height = height || dimensions.height;
        rest = {...defaultObj(rest),width,height}
        const r = [];
        rest = defaultObj(rest);
        count = Math.ceil(defaultNumber(instances,instance,count,3))
        rest.backgroundColor = Colors.isValid(rest.backgroundColor)? rest.backgroundColor : Colors.darken(theme.colors.background); 
        rest.backgroundColor= getBackgroundColor(rest.backgroundColor)// '#cecece';
        if(count <= 1) count = 1;
        for(let i = 1; i<= count; i++){
            r.push(<Component {...rest} key={i+""} />)
        }
        return r;
    }
    const children = getChildren({count});
    return <View ref={innerRef} onLayout = {React.mediaQueryUpdateNativePropsCallback(({target,...args})=>{
        args.layout = args.nativeEvent.layout;
        if(typeof mediaQueryUpdateNativeProps ==='function'){
            const children = getChildren(defaultObj(mediaQueryUpdateNativeProps(args)));
            console.log("will update target ",target,children);
            target.setNativeProps({children});   
        }
    },innerRef)} {...containerProps}
        style={[styles.container,styles.fullWidth,containerProps.style]}
     >
        {children}
    </View>
}   

ContentLoaderWrapper.propTypes = {
    //le nombre d'instance du content loader
    instances : PropTypes.number,
    instance : PropTypes.number,
    count : PropTypes.number,
}

export function Facebook (props){
    return <ContentLoaderWrapper {...props} Component={CLFacebook}/>
}
export function Instagram (props){
    return <ContentLoaderWrapper {...props} Component={CLInstagram}/>
}
export function ContentLoader (props){
    return <ContentLoaderWrapper {...props} Component={ContentLoaderF}/>
}

export function BarChart (props){
    return <ContentLoaderWrapper {...props} Component={BarcharComponent}/>
}

export function PieChart (props){
    return <ContentLoaderWrapper {...props} Component={PieChartComponent}/>
}

export function Form (props){
    const {height} = Dimensions.get("window");
    return <ContentLoaderWrapper
        mediaQueryUpdateNativeProps = {({layout:{width,height}})=>{
            width = Math.max(width-50,200);
            return {width,count:Math.max(Math.trunc(height/formHeight),2)}
         }}
         {...props}
         count = {Math.max(Math.trunc(height/formHeight),2)}
         Component={FormComponent}
    />
}

export function Profile (props){
    let {containerProps,...rest} = props;
    containerProps = Object.assign({},containerProps);
    containerProps.style = [styles.taskListContainer,containerProps.style];
    return <ContentLoaderWrapper count={3} {...props} Component={ProfileComponent}/>
}

export function TaskList (props){
    return <ContentLoaderWrapper count={3} {...props} Component={TaskListComponent}/>
}

export function Datagrid (props){
    const {height} = Dimensions.get("window");
    return <ContentLoaderWrapper
            name = "ddddd"
         mediaQueryUpdateNativeProps ={({layout:{width,height}})=>{
            width = Math.max(props.width-50,200);
            return {width,count:Math.max(Math.trunc((height-100)/datagridHeight),2)} 
         }}
         {...props} 
         Component={DatagridContentLoader}
         count = {Math.max(Math.trunc((height-100)/datagridHeight),2)}
    />
}


const styles = StyleSheet.create({
    fullWidth : {
        width : '100%'
    },
    center : {
        flex : 1,
        justifyContent: 'center',
        alignItems :'center',
    },
    container : {
        marginHorizontal : 0,
        paddingHorizontal : 0,
        marginTop : 10,
        alignItems : 'center',
        justifyContent : 'flex-start'
    },
    taskListContainer : {
        alignItems : 'flex-end',
        alignSelf : 'flex-start',
    },
})