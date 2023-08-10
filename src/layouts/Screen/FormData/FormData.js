import PropTypes from "prop-types";
import FormDataActions from "$ecomponents/Form/FormData/FormDataActions";
import React from "$react";
import {defaultObj,isObj,defaultStr} from "$cutils";
import ScreenContainer from "../Screen";
import {useRoute} from "$cnavigation";
import {Form as FormLoader} from "$ecomponents/ContentLoader";
import HeavyScreen from "$ecomponents/HeavyScreen";
import {goBack} from "$cnavigation";


export default class FormDataLayout extends FormDataActions {
    getComponentProps(props){
        return super.getComponentProps(props);
    }
    getDataProp(){
        return Object.assign({},this.props.data);
    }
    getAppBarProps(){
        const appBarProps = super.getAppBarProps();
        const {beforeGoBack} = appBarProps;
        const params = defaultObj(useRoute().params);
        const mainProps = this.props;
        const {onGoBack} = appBarProps;
        appBarProps.onGoBack = (args)=>{
            if(typeof params.onGoBack =='function' && params.onGoBack(args) == false){
                return;
            } else if(typeof onGoBack =='function'){
                onGoBack(args);
            } else if(typeof mainProps.onGoBack =='function'){
                mainProps.onGoBack(args);
            }
        }
        appBarProps.beforeGoBack = (args)=>{
            if(args.force === true) return true;
            if(typeof beforeGoBack ==='function'){
                return beforeGoBack(args);
            } 
            this.onBackActionPress(args,()=>{
                const {goBack} = args;
                if(typeof goBack =='function'){
                    goBack(true);
                }
            });
            return false;
        }
        return appBarProps;
    }
    canCallOnSuccess(){
        return false;
    }
    close(){
        return goBack(true);
    }
    isLoading(){
        return !!(this.props.isLoading)
    }
    wrapRenderingContent(content,wProps){
        const {
            withHeavyScreen,
            preloader,
            preloaderProps,
        } = this.props;
        const isLoading = this.isLoading();
        wProps = defaultObj(wProps);
        const testID = defaultStr(wProps.testID,this.props.testID,"RN_FormDataScren");
        return <HeavyScreen {...wProps} 
            testID={testID+"_HeavyScreen"} 
            placeholder={React.isValidElement(preloader)? preloader : <FormLoader {...defaultObj(preloaderProps)}/>} 
            enabled={(withHeavyScreen === false)?false:true} 
            isLoading={isLoading}
        >{content}</HeavyScreen>
    }
    _render (content){
        const {testID,...props} = this.props;
        const appBarProps = this.getAppBarActionsProps(props);
        appBarProps.elevation = typeof appBarProps.elevation =='number'? appBarProps.elevation : 5;
        return <ScreenContainer testID={defaultStr(testID,'RN_FormDataLayout')} {...props} appBarProps={appBarProps}>
            {this.wrapRenderingContent(content)}
        </ScreenContainer>
    }
}

FormDataLayout.propTypes = {
    ...FormDataActions.propTypes,
    withHeavyScreen : PropTypes.bool,
    withAppBar : PropTypes.bool, ///si l'appBar sera affiché 
    preloader : PropTypes.node,
    isLoading : PropTypes.bool,//Si l'écran est en mode chargement des données
    preloaderProps : PropTypes.object,
    header : PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.node
    ]),
}

