import {defaultObj} from "$utils";
import i18n from "$i18n"
import Auth from "$cauth";
import Menu from "$ecomponents/Menu";
import React from "$react";
import { screenName } from "$escreens/Auth/Profile";
import Image from "$ecomponents/Image";
import { StyleSheet,View} from "react-native";
import avatarProps from "$eauth/avatarProps";
import Button from "$ecomponents/Button";
import Label from "$ecomponents/Label";
import Icon from "$ecomponents/Icon";
import {navigate} from "$cnavigation";
import theme from "$theme";
import {isMobileNative} from "$cplatform";
import appConfig from "$capp/config";
const UserProfileAvatarComponent = React.forwardRef(({drawerRef,...props},ref)=>{
    let u = defaultObj(Auth.getLoggedUser());
    const deviceNameRef = React.useRef(null);
    const deviceName = appConfig.deviceName;
    props = defaultObj(props);
    const closeDrawer = cb => {
        if(drawerRef && drawerRef.current && drawerRef.current.close){
            return drawerRef && drawerRef.current && drawerRef.current.close(cb);
        }
        return typeof cb =='function'? cb() : null;
    }
    props.src = u.avatar;
    props.size = 60;
      const menItems = [
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
                    closeDrawer(Auth.signOut);
                }
            }
        ];
      let pseudo = defaultStr(u.code,u.pseudo,u.email)
      const label = defaultStr(u.label,u.name,u.fullName,u.userName,u.email)
      //let pT = pseudo;
      //pseudo = <Tooltip uppserCase={false} title={defaultStr(u.label)+" ["+pseudo+"]"}>{pT}</Tooltip>;
      return <View ref ={ref}>
            <Menu
             anchor = { (aProps)=>{
                return <Button
                        normal
                        upperCase = {false}
                        disableRipple
                        title = {"Pressez longtemps pour définir un identifiant unique pour l'appareil"}
                        {...aProps}
                        style = {[styles.container]}
                        onLongPress = {()=>{
                            appConfig.setDeviceName().then((r)=>{
                                if(deviceNameRef.current && deviceNameRef.current.update){
                                    deviceNameRef.current.update(r);
                                }
                            });
                        }}
                        left={props1 => <Image
                            {...props} 
                            {...props1}
                            size={60}
                            style = {styles.itemLeft}
                            testID = {"RN_ProfilAvatar_Avatar"}
                            editable
                            defaultSource ={avatarProps.defaultSrc}
                            onChange = {({dataURL})=>{
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
                        }
                        />}
                        right = {(p)=>{
                            return <Icon 
                                {...p} 
                                {...aProps}
                                secondary
                                size={20} 
                                icon={"chevron-down"}
                                style = {styles.icon}
                            />
                        }}
                    >
                    <View style={styles.labelContainer}>
                        <Label splitText style={{color:theme.colors.primaryOnSurface}}>{pseudo}</Label>
                        <Label splitText style={{fontSize:12,color:theme.colors.secondaryOnSurface,marginTop:6}}>
                            {label}
                        </Label>
                        {deviceName && <Label.withRef textBold splitText title={"Identifiant unique de l'application, installé sur cet appareil"} ref={deviceNameRef} secondary style={{fontSize:11}}>
                            [{deviceName}]
                        </Label.withRef> || null}
                    </View>
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
        maxWidth : 130,
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