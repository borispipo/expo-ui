import {ActivityIndicator} from "react-native";
import Dialog from "$ecomponents/Dialog";
import {defaultVal,isObj,defaultBool,defaultObj,isObjOrArray,defaultStr,uniqid} from "$cutils";
import Label from "$ecomponents/Label";
import {StyleSheet} from "react-native";
import View from "$ecomponents/View";
import PropTypes from "prop-types";
import React,{ createContext} from "$react";
import {isIos} from "$cplatform";
import theme,{Colors} from "$theme";
import Dimensions from "$dimensions";

export const PRELOADERS = {};

const MAIN_PRELOADER_ID = uniqid("main-preloader-id");

const statesProps = ['visible','content','footer','title'];

const PreloaderContext = createContext(null);

export const usePreloader = ()=> defaultObj(React.useContext(PreloaderContext), {subscribe,unsubscribe});

const PreloaderComponent = React.forwardRef((props,ref)=>{
    let {content,children,title,visible:customVisible,right,indicatorProps,id,preloaderId:customPreloaderId,contentProps,actions,footer,...rest} = props;
    const [state,setState] = React.useState({
        visible : defaultBool(customVisible,true),
        visibleKey : false,
    });
    const {visible} = state;
    const isMounted = React.useIsMounted();
    const setVisible = (visible)=>{
        if(!isMounted()) return;
        return setState({...state,visible,visibleKey:!state.visibleKey})
    }
    const [context] = React.useState({});
    const titleRef = React.useRef(title);
    if(titleRef.current !== false){
        title = titleRef.current;
    }
    titleRef.current = false;
    const contentRef = React.useRef(defaultVal(children,content));
    const footerRef = React.useRef(footer);
    if(isObjOrArray(footerRef.current)){
        footer = footerRef.current;
    }
    footerRef.current = null;
    
    content = defaultVal(contentRef.current,content,children,defaultContent)
    contentProps = defaultObj(contentProps);
    indicatorProps = defaultObj(indicatorProps);
    indicatorProps.size = defaultVal(indicatorProps.size,isIos()?'large':48);
    indicatorProps.style = [indicatorProps.style,right?styles.indicatorRight:styles.indicatorLeft];
    indicatorProps.color = Colors.isValid(indicatorProps.color)? indicatorProps.color : theme.colors.primary;
    const preloaderId = React.useRef(defaultStr(id,customPreloaderId,uniqid("preloader-ido-dynamic"))).current;
    const {subscribe,unsubscribe} = usePreloader();
    context.dialogRef = React.useRef(null);
    context.close = ()=>{
        setVisible(false);
    }
    context.open = (args)=>{
        if(!isMounted()) {
            return;
        }
        const arg = getProps(args);
        contentRef.current = defaultVal(arg.content,arg.children);
        if("footer" in arg){
            footerRef.current = arg.footer;
        }
        if("title" in arg){
            titleRef.current = arg.title;
        }
        setVisible(true);
    }
    context.isOpen = context.isVisible = ()=> visible;
    context.isClosed = x => !context.isOpen();
    React.useEffect(()=>{
        if(typeof customVisible ==='boolean' && customVisible !== visible){
            setVisible(customVisible);
        }
    },[props]);
    React.setRef(ref,context);
    subscribe(preloaderId,context);
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
            unsubscribe(preloaderId);
        }
    },[]);
    const {width} = Dimensions.get("window");
    const maxWidth  = Dimensions.isMobileMedia() ? (90*width)/100 : Dimensions.isTabletMedia()? Math.max((70*width/100),350) : 500
    return <Dialog 
                animate = {false}
                overlayProps = {{elevation:5}}
                {...defaultObj(rest)}
                actions={defaultVal(footer,actions)} 
                dismissable={false} 
                visible={visible} 
                title={title} 
                contentProps = {{elevation:0}}
                fullScreen = {false}
                ref = {context.dialogRef}
                isPreloader
            >
            <View style={[styles.container,{maxWidth}]}>
                {!right ? <ActivityIndicator {...indicatorProps}/>:null}
                {content ? <Label numberOfLines={10} {...contentProps} style={[styles.text,contentProps.style]}>{content}</Label> : null}
                {right ? <ActivityIndicator {...indicatorProps}/> : null}
            </View>    
        </Dialog>
});
const styles = StyleSheet.create({
    container : {
        flexDirection:'row',
        alignItems : 'center',
        justifyContent : 'center',
        paddingVertical : 15,
        paddingHorizontal : 20,
    },
    text : {
        marginLeft:20
    },
    content : {},
    indicatorLeft : {
        //marginRight : 16,
    },
    indicatorRight : {
        //marginLeft : 16,
    }
})

PreloaderComponent.propTypes= {
    right : PropTypes.bool, //si l'activity indicator sera à la position droite
    footer : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    ///lorsque le contenu enfant est définit, alors le preloader sera chargé en pleinne page
    children : PropTypes.any,
    visible : PropTypes.bool,
    onOpen : PropTypes.func,
    onClose : PropTypes.func
}
export default PreloaderComponent;

PreloaderComponent.displayName = "PreloaderComponent";

export const subscribe = (preloaderId,context)=>{
    PRELOADERS[preloaderId] = context;
}
export const unsubscribe = (preloaderId)=>{
    delete PRELOADERS[preloaderId];
}

export const defaultContent = PreloaderComponent.defaultContent = "chargement...";

export function PreloaderProvider({ children }) {
    React.useEffect(()=>{
        return ()=>{ unlinkPreloader();}
    },[])
    return (<PreloaderContext.Provider value={{subscribe,unsubscribe}}>
        <PreloaderComponent id={MAIN_PRELOADER_ID} testID={"RN_MainPreloaderProviderComponent"} visible = {false}/>
        {children}
    </PreloaderContext.Provider>);
}

const unlinkPreloader = x=> {
    for(let i in PRELOADERS){
        delete PRELOADERS[i];
    };
    return PRELOADERS;
}


const getProps = (arg,reset)=>{
    let s = {};
    if(typeof arg ==="boolean"){
        s = {visible:arg}
    } else if(React.isValidElement(arg,true)){
        s = {content:arg};
    } else if(isObj(arg)){
        s = arg;
    }
    if(reset !== false){
        statesProps.map(k=>{
            if(k !=='visible' && !s.hasOwnProperty(k)){
                s[k] = null;
            }
        })
    }
    return s;
}

export function isVisible  (){
    for(let i in PRELOADERS){
        if(PRELOADERS[i] && PRELOADERS[i].isOpen()) return true;
    }
    return false;
}
export const isOpen = isVisible;

export function show  (args){
    const preloader = PRELOADERS[MAIN_PRELOADER_ID];
    if(preloader){
        return preloader.open(args)
    }
    return false;
}

export const open = PreloaderComponent.open  = PreloaderComponent.show = show;

export const hide = (all)=>{
    const preloader = PRELOADERS[MAIN_PRELOADER_ID];
    if(preloader){
        return preloader.close();
    }
    return null;
}

export const close = PreloaderComponent.close = PreloaderComponent.hide = hide;


export const closeAll = PreloaderComponent.hideAll = PreloaderComponent.closeAll = ()=>{
    Object.map(PRELOADERS,(p,id)=>{
        if(isObj(p) && p.close){
            p.close();
        }
    })
};

export const hideAll = closeAll;