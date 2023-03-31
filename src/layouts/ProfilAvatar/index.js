import {defaultObj} from "$cutils";
import i18n from "$i18n"
import Auth from "$cauth";
import Menu from "$ecomponents/Menu";
import React from "$react";
import { screenName } from "$escreens/Auth/utils";
import Image from "$ecomponents/Image";
import { StyleSheet,View,Pressable} from "react-native";
import avatarProps from "$eauth/avatarProps";
import Button from "$ecomponents/Button";
import Label from "$ecomponents/Label";
import Icon from "$ecomponents/Icon";
import {navigate} from "$cnavigation";
import theme from "$theme";
import {isMobileNative} from "$cplatform";
import appConfig from "$capp/config";
import Preloader from "$preloader";
import {defaultNumber} from "$cutils";
import Tooltip from "$ecomponents/Tooltip";
const UserProfileAvatarComponent = React.forwardRef(({drawerRef,chevronIconProps:customChevronIconProps,size,withLabel,...props},ref)=>{
    let u = defaultObj(Auth.getLoggedUser());
    const deviceNameRef = React.useRef(null);
    const deviceName = appConfig.deviceName;
    customChevronIconProps = defaultObj(customChevronIconProps);
    props = defaultObj(props);
    const closeDrawer = cb => {
        if(drawerRef && drawerRef.current && drawerRef.current.close){
            return drawerRef && drawerRef.current && drawerRef.current.close(cb);
        }
        return typeof cb =='function'? cb() : null;
    }
    if(withLabel === undefined){
        withLabel = theme.showProfilAvatarOnDrawer;
    }
     withLabel = withLabel !== false ? true : false;
    props.src = u.avatar;
    size = defaultNumber(size,!withLabel?40:40);
    const userPseudo = Auth.getUserPseudo();
    const pseudo = defaultStr(userPseudo,Auth.getUserEmail(),Auth.getUserCode());
    const label = defaultStr(Auth.getUserFullName(),userPseudo);
    const onLongPress = ()=>{
        appConfig.setDeviceId().then((r)=>{
            if(deviceNameRef.current && deviceNameRef.current.update){
                deviceNameRef.current.update(r?("["+r+"]"):"");
            }
        });
    };
    const tooltip = "Pressez longtemps pour définir un identifiant unique pour l'appareil";
    const children = <View style={[styles.labelContainer,!withLabel && theme.styles.justifyContentCenter]}>
        <Label splitText numberOfLines={1} style={{color:theme.colors.primaryOnSurface,fontSize:15}}>{pseudo}</Label>
        <Label splitText numberOfLines={1} style={[{fontSize:12,color:theme.colors.secondaryOnSurface,marginTop:6},!withLabel && {textAlign:'center'}]}>
            {label}
        </Label>
        {deviceName && <Label.withRef textBold splitText title={"Identifiant unique de l'application, installé sur cet appareil"} ref={deviceNameRef} secondary style={{fontSize:10}}>
            [{deviceName}]
        </Label.withRef> || null}
    </View>
      const menItems = [
            !withLabel && {
                text : <Tooltip tooltip={tooltip} Component={Pressable} onLongPress={onLongPress} testID={"RNProfilAvatar_ContainerMenu"}>
                    {children}
                </Tooltip>,
                closeOnPress : false,
                divider : true,
            },
            {
                label : i18n.lang("preferences",'Préférences'),
                icon : "account-cog",
                onPress : (a)=>{
                    closeDrawer(()=>{
                        return navigate({
                            routeName : screenName,
                            params : {
                                user : u,
                            }
                        })
                    });
                }
            },
            {
                label : i18n.lang("logout",'Déconnexion'),
                icon : "logout",
                onPress : (a)=>{
                    closeDrawer(()=>{
                        Preloader.open("Déconnexion en cours...");
                        Auth.signOut().finally(Preloader.close)
                    });
                }
            }
        ];
      
      const onChangeAvatar = ({dataURL})=>{
            if(u.avatar === dataURL) {
                return;
            }
            if(!dataURL){
                u.avatar = null;
            } else {
                u.avatar = dataURL;
            }
            Auth.upsertUser({...u,avatar:u.avatar},false);
      }

      return <View ref ={ref}>
            <Menu
             anchor = { (aProps)=>{
                const chevronIconProps = {
                    size : 20,
                    icon : "chevron-down",
                    secondary : true,
                    ...customChevronIconProps,
                    ...aProps,
                    style : [styles.icon,withLabel=== false && {color:theme.colors.primaryText},customChevronIconProps.style],
                }
                if(!withLabel){
                    return <View testID={"RNProfilAvatar_AvatarContainer"} style={[theme.styles.row,theme.styles.alignItemsCenter]}>
                        <Image
                            {...props} 
                            {...aProps}
                            size={size}
                            style = {styles.itemLeft}
                            testID = {"RN_ProfilAvatar_Avatar"}
                            editable
                            defaultSource ={avatarProps.defaultSrc}
                            onChange = {onChangeAvatar}
                        />
                        <Icon 
                            {...chevronIconProps}
                            {...aProps}
                            style = {[chevronIconProps.style,{marginLeft:-5}]}
                        />
                    </View>
                }
                return <Button
                        normal
                        upperCase = {false}
                        disableRipple
                        title = {tooltip}
                        {...aProps}
                        style = {[styles.container]}
                        surfaceProps = {{style:[theme.styles.noMargin,theme.styles.noPadding]}}
                        onLongPress = {onLongPress}
                        left={props1 => <Image
                            {...props} 
                            {...props1}
                            size={size}
                            style = {styles.itemLeft}
                            testID = {"RN_ProfilAvatar_AvatarImage"}
                            editable
                            defaultSource ={avatarProps.defaultSrc}
                            onChange = {onChangeAvatar}
                        />}
                        right = {(p)=>{
                            return <Icon 
                                {...p} 
                                {...chevronIconProps}
                            />
                        }}
                    >
                    {children}
                    </Button>
            } }  
            items={menItems}
        />
      </View>
});

const styles = StyleSheet.create({
    itemLeft : {
        marginHorizontal : 5,
        marginTop : isMobileNative()? 10 : 0,
    },
    container : {
        marginLeft : 0,
        marginVertical : 10,
    },
    labelContainer : {
        flexDirection : 'column',
        paddingRight : 5,
        maxWidth : 150,
        minWidth : 100,
    },
    pseudo : {
        flexDirection : "row",
        justifyContent : "center",
        alignItems : "center"
    },
    appName : {
        marginLeft : 5,
        fontWeight : "bold",
    },
    icon : {
        marginHorizontal:0,
        paddingHorizontal : 0,
    }
})

export default UserProfileAvatarComponent;

UserProfileAvatarComponent.displayName = "UserProfileAvatarComponent";