import React from "$react";
import { Button, Image, StyleSheet} from 'react-native';
import View from "$ecomponents/View";
import { Asset } from 'expo-asset';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import {defaultObj} from "$utils";
import Dialog from "$ecomponents/Dialog";

const ImageEditorComponent = React.forwardRef((props,ref)=>{
    let {source,dialogProps,visible,imageProps,...rest} = props;
    const isMounted = React.useIsMounted();
    const [context] = React.useStateIfMounted({});
    imageProps = defaultObj(imageProps);
    dialogProps = defaultObj(dialogProps);
    context.dialogRef = React.useRef(null);
    React.useEffect(()=>{
        React.setRef(ref,context);
    })
    return (<Dialog {...dialogProps} visible={visible} actions={[]} ref={context.dialogRef} fullScreen>
        <View style={styles.container}>
            <Image
                resizeMode = {"contain"}
                {...imageProps}
                source={source}
                style={[imageProps.style]}
            />
        </View>
    </Dialog>
  );
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