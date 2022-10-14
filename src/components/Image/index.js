import {Image,View} from "react-native";
import Menu from "$components/Menu";
import Avatar from "$components/Avatar";
import {TouchableOpacity,Pressable} from "react-native";
import {isDecimal,setQueryParams,isValidURL,defaultStr as defaultString,isDataURL,isPromise,defaultBool,isObj,isNonNullString} from "$utils";
import {notify} from "$components/Dialog";
let maxWidthDiff = 150, maxHeightDiff = 150;
import {StyleSheet} from "react-native";
import React from "$react";
import PropTypes from "prop-types";
import {isMobileNative} from "$platform";
//import Signature from "$components/Signature";
import Label from "$components/Label";
//import Editor from "./Editor";


import {pickImage,nonZeroMin,canTakePhoto,takePhoto} from "$media";
import addPhoto from "$assets/add_photo.png";

export const isAssets = (asset,staticAssets)=>{
    return isObj(asset) && isDecimal(asset.width) && isDecimal(asset.height) && isNonNullString(asset.uri) && (staticAssets ? asset.uri.contains("/static/"):true);
}
export const isValidImageSrc = (src)=>{
    if(!isNonNullString(src)) return false;
    return isDataURL(src)? true : isValidURL(src) ? true : src.contains("/static/media/")? true  : false;
}
export const resolveAssetSource = (source)=>{
    if(!source && !isDecimal(source)) return undefined;
    try {
        return Image.resolveAssetSource(source);
    } catch(e){
        console.log(r," triing to resolve image asset from source ",source)
        return undefined;
    }
}
export const getUri = (src,onlySting)=>{
    if(isAssets(src)) return src.uri;
    if(isDecimal(src)){
        if(onlySting !== false){
            return resolveAssetSource(src)?.uri;
        }
        return resolveAssetSource(src);
    }
    if(isObj(src) && isValidImageSrc(src.uri)){
        return src.uri;
    } else if(isValidImageSrc(src)) return src;
    return null;
}

export default function ImageComponent(props){
    const [src,setSrc] = React.useStateIfMounted(defaultVal(props.src));
    const prevSrc = React.usePrevious(src);
    /*const [editorProps,setEditorProps] = React.useStateIfMounted({
        visible : false,
        options : {}
    })*/ 
    const [isDrawing,setIsDrawing] = React.useStateIfMounted(false);
    let {disabled,onMount,defaultSource,onUnmount,label,text,labelProps,readOnly,beforeRemove,
        onChange,draw,round,drawText,drawLabel,rounded,editable,defaultSrc,
        createSignatureOnly,pickImageProps,width,height,cropProps,size,resizeProps,containerProps,
        menuProps,pickUri,drawProps,imageProps,testID,...rest} = props;
    rest = defaultObj(rest);
    pickImageProps = defaultObj(pickImageProps);
    cropProps = defaultObj(cropProps);
    draw = defaultBool(draw,true);
    label = defaultVal(label,text);
    labelProps = defaultObj(labelProps);
    disabled = defaultVal(disabled,false);
    readOnly = defaultBool(readOnly,false);
    menuProps = defaultObj(menuProps);
    round = defaultBool(round,rounded,true);
    containerProps = defaultObj(containerProps);
    drawProps = defaultObj(drawProps);
    let content = null;
    defaultSrc = defaultVal(defaultSrc);
    editable = defaultBool(editable,true);
    if(disabled){
        editable = false;
    }
    React.useEffect(()=>{
        if(src == props.src) return;
        setSrc(props.src);
    },[props.src])
    
    if(isDecimal(width) && width > 0){
        rest.width = width;
    } 
    if(isDecimal(height) && height > 0){
        rest.height = height;
    } 
    if(isDecimal(size) && size > 10){
        rest.size = Math.trunc(size);
    } else {
        rest.size = 50;
    }

    let imageWidth, imageHeight;
    if(isDecimal(width) && width){
        imageWidth = width
    } 
    if(isDecimal(height) && height){
        imageHeight = height;
    } 
    if(!imageWidth && !imageHeight){
        imageWidth = imageHeight = rest.size;
    }
    let cropWidth = nonZeroMin(cropProps.width,width)
    let cropHeight = nonZeroMin(cropProps.height,height);
    if(!cropWidth) cropWidth = undefined;
    if(!cropHeight) cropHeight = undefined; 

    const getCropProps = (opts)=>{
        opts = defaultObj(opts);
        let canCrop = defaultBool(opts.allowsEditing,true); 
        if(cropWidth || cropHeight){
            canCrop = true;
            if(cropWidth) opts.width = cropWidth;
            else if(cropHeight) opts.height = cropHeight;
        }
        opts.allowsEditing = canCrop;
        return opts;
    }
    const handlePickedImage = (image,opts)=>{
        opts = defaultObj(opts);
        image.dataUrl = image.dataURL = 'data:image/jpeg;base64,'+image.base64;
        let diffWidth = image.width - cropWidth - maxWidthDiff,
        diffHeight = image.height - cropHeight - maxHeightDiff;
        let canCrop = isMobileNative()? false : ((width && diffWidth > 0) || (height && diffHeight > 0)? true : false);
        const imageSrc = pickUri ? image.uri : image.dataURL;
        if(canCrop){
            return context.cropImage({source:image,uri:image.dataURL,...opts}).then((props)=>{
                setSrc(imageSrc)
            });
        }
        setSrc(imageSrc);
        return image;
    }
    const context = {
        setSrc,
        deleteImage : React.useCallback(()=>{
            if(typeof beforeRemove =='function'){
                const r = beforeRemove({context});
                if(r === false) return;
                const cb = (r)=>{
                    if(isNonNullString(r)){
                        notify.error(r);
                        return false;
                    }
                    setSrc(null);
                }
                if(isPromise(r)){
                    return r.then(cb);
                } else cb();
            } else {
                setSrc(null);
            }
        },[src]),
        cropImage : (props)=>{
            return Promise.resolve(props);
            return new Promise((resolve,reject)=>{
                console.log({...editorProps,visible:true,...props},"is editor props");
                setEditorProps({...editorProps,visible:true,...props})
            })
        },
        pickImage : (opts)=>{
            opts = getCropProps(opts);
            opts.base64 = true;
            return pickImage(opts).then((image)=>handlePickedImage(image,opts));
        },
        draw : ()=>{
            setIsDrawing(true);
        },
    }
    React.useEffect(()=>{
        if(src === prevSrc)return;
        if(typeof onChange =='function'){
            onChange({context,src,deleted:src == null?true:false,dataURL:src,dataUrl:src})
        }
    },[src])
    React.useEffect(()=>{
        if(typeof onMount =='function'){
            onMount({context});
        }
        return ()=>{
            if(typeof onUnmount =='function'){
                onUnmount({context});
            }
        }
    },[])
    let defaultURI = getUri(defaultVal(defaultSource,defaultSrc));
    if(!defaultURI){
        defaultURI = getUri(addPhoto);
    }
    let uri = getUri(src) || defaultURI
    let canUpdate = uri !== defaultURI;
    if(isValidURL(uri)){
        uri = setQueryParams(uri,'cache',(new Date()).getTime());
    }
    let source = isNumber(uri)? uri : isObj(uri)? uri : {uri};
    if(isObj(src)){
        source = {...src,...source};
    }
    imageProps = defaultObj(imageProps);
    testID = defaultStr(testID,"RN_ImageComponent");
    let menuItems = []
    if(editable){
        menuItems.push({
            label : 'Sélect Image',
            icon :'image-search',
            onPress : (a)=>{
                context.pickImage();
            }
        })
    }
    (async ()=>{
        if(false && await canTakePhoto()){
            menuItems.push({
                label : 'Eng photo',
                icon : 'camera',
                onPress : (a)=>{
                    takePhoto().then(handlePickedImage);
                }
            })
        }
    })();

    if(canUpdate && editable){
        menuItems.push({
            key : 'has-photo',
            label : 'Retirer la photo',
            icon : "image-off",
            onPress : x=> context.deleteImage()
        })
    }
    if(false && defaultBool(draw ,true) && editable){
        menuItems.push({
            key : "drawImageCustom",
            label : defaultString(drawText,drawLabel,'Faire un dessin'),
            icon : "signature-image",
            onPress : (c)=>{
                context.draw(c);
                console.log(c," pressed ")
            }
        })
    }
    const _label = defaultString(label);
    const isDisabled = menuItems.length > 0 ? true : false; 
    const pointerEvents = isDisabled ? "auto" :"none";
    return <View testID={testID+"_FagmentContainer"}>
        {!createSignatureOnly ? (<Menu
                {...menuProps}
                disabled = {isDisabled}
                anchor = {(props)=>{
                    return <View pointerEvents={pointerEvents} accessibilityLabel = {_label} testID={testID+"_Container"} {...containerProps} pointerEvents={disabled|| readOnly? "none":"auto"} style={[label?styles.align:null,containerProps.style,label?styles.container:null]}>
                        {<Label testID={testID+"_Label"} {...labelProps} disabled={disabled} style={[styles.label,labelProps.style]}>{label}</Label>}
                        {<Avatar
                            resizeMethod = {"auto"}
                            resizeMode = {"contain"}
                            {...rest}
                            testID = {testID}
                            width = {imageWidth}
                            height = {imageHeight}
                            imageProps = {imageProps}
                            {...props}
                            style = {[rest.style]}
                            rounded = {round}
                            image = {true}
                            source = {source}
                        />}
                    </View>
            }}
            items = {menuItems}
        />) : null}
        {false && <Signature testID={testID+"_Signature"} visible = {isDrawing} dialogProps = {{
            onDismiss :()=>{
                setIsDrawing(false);
                return false;
            }
        }} />}
    </View>
}

const styles = StyleSheet.create ({
    align : {
      alignItems : 'center',
      justifyContent : 'flex-start',
    },
    container : {
      flexDirection:'row',
      justifyContent : 'flex-start',
      alignItems : 'center',
      width : '100%'
      //flex:1,
    },
    label: {
        marginRight : 5,
    },
})

ImageComponent.propTypes = {
    containerProps : PropTypes.object,//les props du container entre le lable et l'image rendu
    menuProps : PropTypes.object, ///les props du menu d'édition du composant,
    editable : PropTypes.bool,
    disabled: PropTypes.bool,
    pickUri : PropTypes.bool,////si l'uri sera retournée lorsqu'on pick l'image en lieu et place du dataURL
    imageProps : PropTypes.object, ///les props supplémentaires du composant Image
    draw : PropTypes.bool, //si l'on peut déssiner une image
    pickImageProps : PropTypes.object, ///les options à passer à la fonction pickImage, pour récupérer une image enregistrée en machine
}