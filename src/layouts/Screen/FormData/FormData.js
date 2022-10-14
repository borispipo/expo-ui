import PropTypes from "prop-types";
import FormDataActions from "$ecomponents/Form/FormData/FormDataActions";
import React from "$react";
import {defaultObj,isObj,defaultStr} from "$utils";
import ScreenContainer from "../Screen";
import {useRoute} from "$enavigation/utils";
import {Form as FormLoader} from "$ecomponents/ContentLoader";
import HeavyScreen from "$ecomponents/HeavyScreen";
import {goBack,getScreenProps} from "$enavigation/utils";


export default class FormDataLayout extends FormDataActions {
    getComponentProps(props){
        this.__mainProps = null;
        return super.getComponentProps(getScreenProps(props));
    }
    /***les props à passer au container de la liste à rendre */
    getScreenProps(){
        return {};
    }
    getMainProps (){
        if(isObj(this.__mainProps) && Object.size(this.__mainProps,true)) return this.__mainProps;
        this.__mainProps = getScreenProps(this.props);
        return this.__mainProps;
    }
    getDataProp(){
        return Object.assign({},this.getMainProps().data);
    }
    getAppBarProps(){
        const appBarProps = super.getAppBarProps();
        const {beforeGoBack} = appBarProps;
        const params = defaultObj(useRoute().params);
        const mainProps = this.getMainProps();
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
    wrapRenderingContent(content,wProps){
        let {
            withHeavyScreen,
            preloader,
            preloaderProps,
            testID,
        } = this.props;
        wProps = defaultObj(wProps);
        const useHeavyScreen = withHeavyScreen !== false ? true : false;
        const Wrapper = useHeavyScreen ? HeavyScreen : React.Fragment;
        testID = defaultStr(wProps.testID,testID,"RN_FormDataScren");
        const placeholder = React.isValidElement(preloader)? preloader : <FormLoader {...defaultObj(preloaderProps)}/>;
        const wrapperProps = useHeavyScreen ? {...wProps,placeholder,testID:testID+"_HeavyScreen"} : {}
        return <Wrapper {...wrapperProps}>
            {content}
        </Wrapper>
    }
    _render (content){
        const {testID,...props} = getScreenProps(this.props);
        const appBarProps = this.getAppBarActionsProps(props);
        appBarProps.elevation = typeof appBarProps.elevation =='number'? appBarProps.elevation : 5;
        return <ScreenContainer testID={defaultStr(testID,'RN_FormDataLayout')} {...props} {...defaultObj(this.getScreenProps())} appBarProps={appBarProps}>
                {this.wrapRenderingContent(content)}
        </ScreenContainer>
    }
}

FormDataLayout.propTypes = {
    ...FormDataActions.propTypes,
    withHeavyScreen : PropTypes.bool,
    withAppBar : PropTypes.bool, ///si l'appBar sera affiché 
    preloader : PropTypes.node,
    preloaderProps : PropTypes.object,
    header : PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.node
    ]),
}

