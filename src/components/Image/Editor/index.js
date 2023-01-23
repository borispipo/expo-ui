import React from "$react";
import { Button, Image, StyleSheet} from 'react-native';
import View from "$ecomponents/View";
import { ImageEditor } from "expo-image-editor";
import {defaultObj} from "$utils";

const ImageEditorComponent = React.forwardRef((props,ref)=>{
    let {source,uri,onSuccess,imageUri,lockAspectRatio,dialogProps,onDismiss,visible,imageProps,...rest} = props;
    const isMounted = React.useIsMounted();
    const [context] = React.useState({});
    imageProps = defaultObj(imageProps);
    dialogProps = defaultObj(dialogProps);
    context.dialogRef = React.useRef(null);
    const [imageData,setImageData] = React.useState(null);


    return <View style={[styles.container]}>
            <Image
                style={{ height: 300, width: 300 }}
                source={{ uri: imageData?.uri }}
            />
            <ImageEditor
                ref = {(el)=>{
                    React.setRef(ref,el);
                }}
                visible={visible}
                onCloseEditor={onDismiss}
                imageUri={imageUri || uri}
                fixedCropAspectRatio={16 / 9}
                lockAspectRatio={lockAspectRatio}
                minimumCropDimensions={minimumCropDimensions}
                onEditingComplete={(result) => {
                    setImageData(result);
                }}
                mode="full"
            />
    </View>
})

export default ImageEditorComponent;

const styles = StyleSheet.create({
    container : {
        flex : 1,
        alignItems : 'center',
        justifyContent : 'center',
        paddingHorizontal : 30,
        paddingVertical : 30,
    }
})

ImageEditorComponent.displayName = "ImageEditorComponent";