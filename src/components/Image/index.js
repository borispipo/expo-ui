import {Image,View} from "react-native";
import Menu from "$ecomponents/Menu";
import Avatar from "$ecomponents/Avatar";
import {isDecimal,setQueryParams,isValidURL,defaultDecimal,defaultStr as defaultString,isDataURL,isPromise,defaultBool,isObj,isNonNullString} from "$cutils";
import notify from "$enotify";
import {StyleSheet} from "react-native";
import React from "$react";
import PropTypes from "prop-types";
import {isMobileNative} from "$cplatform";
import {getUri} from "./utils";
import {uniqid} from "$cutils";
//import Signature from "$ecomponents/Signature";
import Label from "$ecomponents/Label";
//import Cropper from "./Cropper";
import {pickImage,nonZeroMin,canTakePhoto,takePhoto} from "$emedia";
import addPhoto from "$eassets/add_photo.png";

let maxWidthDiff = 100, maxHeightDiff = 100;

export * from "./utils";

export default function ImageComponent(props){
    const [src,setSrc] = React.useState(defaultVal(props.src));
    const [cropWindowProp,setCropWindowProp] = React.useState(null);
    const prevSrc = React.usePrevious(src);
    const [isDrawing,setIsDrawing] = React.useState(false);
    let {disabled,onMount,defaultSource,editable,onUnmount,label,text,labelProps,readOnly,beforeRemove,
        onChange,draw,round,drawText,drawLabel,rounded,defaultSrc,
        createSignatureOnly,pickImageProps,width,height,cropProps,size,resizeProps,containerProps,
        menuProps,pickUri,drawProps,imageProps,length,testID,withLabel,...rest} = props;
    const pickedImageRef = React.useRef(null);
    pickImageProps = defaultObj(pickImageProps);
    cropProps = defaultObj(cropProps);
    draw = defaultBool(draw,true);
    label = defaultVal(label,text);
    labelProps = defaultObj(labelProps);
    disabled = defaultVal(disabled,false);
    readOnly = defaultBool(readOnly,false);
    menuProps = defaultObj(menuProps);
    rounded = defaultBool(rounded,round,true);
    containerProps = defaultObj(containerProps);
    drawProps = defaultObj(drawProps);
    const flattenStyle = StyleSheet.flatten(props.style) || {};
    defaultSrc = defaultVal(defaultSrc);
    if(disabled){
        readOnly = true;
    }
    if(editable ===false){
        readOnly = true;
    }
    React.useEffect(()=>{
        if(src == props.src) return;
        setSrc(props.src);
    },[props.src])
    
    if(!isDecimal(width) && isDecimal(flattenStyle.width)){
        width = flattenStyle.width;
    }
    if(!isDecimal(height) && isDecimal(flattenStyle.height)){
        height = flattenStyle.height;
    }
    if(isDecimal(width) && width > 0){
        rest.width = width;
    } 
    
    if(isDecimal(height) && height > 0){
        rest.height = height;
    } 
    
    if(isDecimal(size) && size > 10){
        rest.size = Math.trunc(size);
    } else {
        const sZize = Math.min(defaultDecimal(width),defaultDecimal(height));
        rest.size = sZize >= 10 ? sZize : 50;
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
    let cropWidth = nonZeroMin(cropProps.width,imageWidth,width,size)
    let cropHeight = nonZeroMin(cropProps.height,imageHeight,height,size);
    if(!cropWidth) cropWidth = undefined;
    if(!cropHeight) cropHeight = undefined; 

    const getCropProps = (opts)=>{
        opts = defaultObj(opts);
        let canCrop = defaultBool(opts.allowsEditing,true); 
        if(cropWidth || cropHeight){
            canCrop = true;
            if(cropWidth) opts.width = cropWidth;
            if(cropHeight) opts.height = cropHeight;
        }
        opts.allowsEditing = canCrop;
        return {...cropProps,...opts};
    }
    const handlePickedImage = (image,opts)=>{
        opts = defaultObj(opts);
        if(!isDataURL(image.dataURL)){
            return notify.error(`Le fichier sélectionné est une image non valide`);
        }
        const imageSrc = pickUri ? image.uri : image.dataURL;
        if(imageSrc){
            const diffWidth = image.width - cropWidth - maxWidthDiff,diffHeight = image.height - cropHeight - maxHeightDiff;
            const canCrop = isMobileNative()? false : ((diffWidth > 0) || (diffHeight > 0)? true : false);
            if(canCrop){
                const cProps = getCropProps(opts);
                return context.cropImage({...cProps,source:image,uri:image.dataURL,src:imageSrc}).then((props)=>{
                    setSrc(imageSrc)
                });
            }
        }
        pickedImageRef.current = image;
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
            if(!isMobileNative()){
                return new Promise((resolve,reject)=>{
                    setCropWindowProp(props);
                });
            }
            return new Promise((resolve,reject)=>{
                console.log({...editorProps,visible:true,...props},"is editor props");
                setEditorProps({...editorProps,visible:true,...props})
            })
        },
        pickImage : ()=>{
            const opts = getCropProps(defaultObj(pickImageProps));
            opts.base64 = true;
            return pickImage(opts).then((image)=>handlePickedImage(image,opts));
        },
        draw : ()=>{
            setIsDrawing(true);
        },
    }
    React.useEffect(()=>{
        if(src === prevSrc) {
            pickedImageRef.current = null;
            return;
        }
        if(typeof onChange =='function'){
            onChange({context,...defaultObj(pickedImageRef.current),src,deleted:src == null?true:false,dataURL:src,dataUrl:src})
        }
        pickedImageRef.current = null;
    },[src]);
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
    if(!readOnly){
        menuItems.push({
            label : 'Sélect Image',
            icon :'image-search',
            onPress : (a)=>{
                context.pickImage();
            }
        })
    }
    if(isMobileNative() && !readOnly){
        menuItems.push({
            label : 'Enregistrer une photo',
            icon : 'camera',
            onPress : (a)=>{
                const opts = getCropProps(defaultObj(pickImageProps));
                opts.base64 = true;
                takePhoto(opts).then(handlePickedImage);
            }
        })
    }

    if(canUpdate && !readOnly){
        menuItems.push({
            key : 'has-photo',
            label : 'Retirer la photo',
            icon : "image-off",
            onPress : x=> context.deleteImage()
        })
    }
    if(false && defaultBool(draw ,true) && !readOnly){
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
    const _label = withLabel !== false ? defaultString(label) : "";
    const isDisabled = menuItems.length > 0 ? true : false; 
    return <View testID={testID+"_FagmentContainer"}>
        {false && src && !isMobileNative() && isObj(cropWindowProp) && Object.size(cropWindowProp,true) ? <Cropper
            src={src}
            {...cropWindowProp}
            key = {uniqid("crop-image")}
        /> : null}
        {!createSignatureOnly ? (<Menu
                {...menuProps}
                disabled = {isDisabled}
                anchor = {(props)=>{
                    return <View aria-label={_label} testID={testID+"_Container"} {...containerProps} style={[label?styles.align:null,containerProps.style,{pointerEvents:disabled|| readOnly? "none":"auto"},label?styles.container:null]}>
                        {withLabel !== false ? <Label testID={testID+"_Label"} {...labelProps} disabled={disabled} style={[styles.label,labelProps.style]}>{label}</Label>:null}
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
                            rounded = {rounded}
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
    readOnly : PropTypes.bool,
    disabled: PropTypes.bool,
    editable : PropTypes.bool,//si la source de l'image peut être modifiée, via le menu Sélectionner une image ou prendre une photo en fonction de la plateforme
    pickUri : PropTypes.bool,////si l'uri sera retournée lorsqu'on pick l'image en lieu et place du dataURL
    imageProps : PropTypes.object, ///les props supplémentaires du composant Image
    draw : PropTypes.bool, //si l'on peut déssiner une image
    pickImageProps : PropTypes.object, ///les options à passer à la fonction pickImage, pour récupérer une image enregistrée en machine
}