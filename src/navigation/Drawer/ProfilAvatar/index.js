import {defaultObj} from "$utils";
import i18n from "$i18n"
import Auth from "$cauth";
import Menu from "$components/Menu";
import React from "$react";
import Tooltip from "$components/Tooltip";
import Image from "$components/Image";
import { StyleSheet,View} from "react-native";
import defaultSource from "./defaultAvatar";
import Button from "$components/Button";
import Label from "$components/Label";
import Icon from "$components/Icon";
import {navigate} from "$navigation/utils";
import theme from "$theme";
import {isMobileNative} from "$platform";

const UserProfileAvatarComponent = React.forwardRef(({drawerRef,...props},ref)=>{
    let u = defaultObj(Auth.getLoggedUser());
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
                            //routeName : screenName,
                            params : {
                                code : defaultStr(u.code),
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
                    closeDrawer(Auth.logout);
                }
            }
        ];
      let pseudo = defaultStr(u.code);
      let pT = pseudo;
      if(pseudo.length > 8){
          pT = pseudo.substring(0,7)+".."
      }
      pseudo = <Tooltip title={defaultStr(u.label)+" ["+pseudo+"]"}>{pT}</Tooltip>;
      return <View ref ={ref}>
            <Menu
             anchor = { (aProps)=>{
                return <Button
                        normal
                        disableRipple
                        {...aProps}
                        style = {[styles.container]}
                        left={props1 => <Image
                            {...props} 
                            {...props1}
                            size={60}
                            style = {styles.itemLeft}
                            testID = {"RN_ProfilAvatar_Avatar"}
                            editable
                            defaultSource ={defaultSource}
                            onChange = {({dataURL})=>{
                                if(u.avatar === dataURL) {
                                    return;
                                }
                                if(!dataURL){
                                    u.avatar = null;
                                } else {
                                    u.avatar = dataURL;
                                }
                                Auth.upsertUser({code:u.code,avatar:u.avatar},false);
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
                        <Label splitText style={{color:theme.colors.primaryOnSurface}}>{u.code}</Label>
                        <Label splitText style={{fontSize:12,color:theme.colors.secondaryOnSurface,marginTop:6}}>
                            {u.label}
                        </Label>
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