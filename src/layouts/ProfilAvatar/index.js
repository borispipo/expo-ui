import {defaultObj} from "$cutils";
import i18n from "$i18n"
import Auth from "$cauth";
import Menu from "$ecomponents/Menu";
import React from "$react";
import { screenName } from "$escreens/Auth/utils";
import Image from "$ecomponents/Image";
import { StyleSheet,View,Pressable} from "react-native";
import avatarProps from "$eauth/avatarProps";
import Label from "$ecomponents/Label";
import Icon from "$ecomponents/Icon";
import {navigate} from "$cnavigation";
import theme from "$theme";
import {isMobileNative} from "$cplatform";
import appConfig from "$capp/config";
import Preloader from "$preloader";
import {defaultNumber} from "$cutils";
import Tooltip from "$ecomponents/Tooltip";
import PropTypes from "prop-types";
import { useContext } from "$econtext/hooks";

const UserProfileAvatarComponent = React.forwardRef(({drawerRef,renderedOnAppBar,chevronIconProps:customChevronIconProps,size,withLabel,menuItems,...props},ref)=>{
    let u = defaultObj(Auth.getLoggedUser());
    const deviceNameRef = React.useRef(null);
    const deviceName = appConfig.deviceName;
    customChevronIconProps = defaultObj(customChevronIconProps);
    props = defaultObj(props);
    const navigateToPreferences = (a)=>{
        closeDrawer(()=>{
            return navigate({
                routeName : screenName,
                params : {
                    user : u,
                }
            })
        });
    };
    const signOut = (a)=>{
        closeDrawer(()=>{
            Preloader.open("Déconnexion en cours...");
            Auth.signOut().finally(Preloader.close)
        });
    };
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
    const defaultPseudo = "Default User";
    const canSignOut = Auth.canSignOut();
    const {components:{profilAvatarProps}} = useContext();
    const customProps = Object.assign({},typeof profilAvatarProps =='function'? profilAvatarProps({...props,signOut,navigateToPreferences,canSignOut,closeDrawer,user:u,size,close:closeDrawer,setDeviceId:onLongPress,renderedOnAppBar,}) : profilAvatarProps);
    if(typeof customProps.size =="number"){
        size = customProps.size;
    }
    const pseudo = defaultStr(customProps.pseudo,userPseudo,Auth.getUserCode(),Auth.getUserEmail(),appConfig.authDefaultUsername,defaultPseudo);
    const label = defaultStr(customProps.label,Auth.getUserFullName(),userPseudo);
    delete customProps.label;
    const onLongPress = ()=>{
        appConfig.setDeviceId().then((r)=>{
            if(deviceNameRef.current && deviceNameRef.current.update){
                deviceNameRef.current.update(r?("["+r+"]"):"");
            }
        });
    };
    const pseudoTooltip = (pseudo == defaultPseudo ? `Pour modifier la valeur du pseudo actuel, définissez dans le fichier package.json, la propriété : authDefaultUsername de type chaine de caractère`:"");
    const tooltip = "Pressez longtemps pour définir un identifiant unique pour l'appareil";
    const testID = defaultStr(customProps.testID,props.testID,"RN_ProfilAvatar")
    const pseudoContent = <Label testID={testID+"_PseudoContent"} splitText numberOfLines={1} style={{color:theme.colors.primaryOnSurface,fontSize:15}}>{pseudo}</Label>;
    const children = <View testID={testID+"_AnchorContainer"} style={[styles.labelContainer,!withLabel && theme.styles.justifyContentCenter]}>
        {pseudoTooltip?<Tooltip title={pseudoTooltip}>
            {pseudoContent}
        </Tooltip>:pseudoContent}
        {label != pseudo ? <Label testID={testID+"_ProfilAvatarLabel"} splitText numberOfLines={1} style={[{fontSize:12,color:theme.colors.secondaryOnSurface,marginTop:6},!withLabel && styles.withNotLabel]}>
            {label}
        </Label>:null}
        {deviceName && <Label.withRef testID={testID+"_ProfilAvatarDeviceName"} textBold splitText title={"Identifiant unique de l'application, installé sur cet appareil"} ref={deviceNameRef} secondary style={{fontSize:10}}>
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
            ...(Array.isArray(menuItems)? menuItems : isObj(menuItems)? Object.keys(menuItems).map(k=>{
                return menuItems[k];
              }) : []),
              ...(Array.isArray(customProps.menuItems)? customProps.menuItems : isObj(customProps.menuItems)? Object.keys(customProps.menuItems).map(k=>{
                return customProps.menuItems[k];
              }) : []),
            customProps.preferencesMenuItem != false && {
                label : i18n.lang("preferences",'Préférences'),
                icon : "account-cog",
                onPress : navigateToPreferences,
            },
            canSignOut && customProps.signOutMenuItem !== false && {
                label : i18n.lang("logout",'Déconnexion'),
                icon : "logout",
                onPress : signOut,
            },
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
      return <View ref ={ref} testID={testID+"_ProfilAvatarWrapper"}>
            <Menu
             anchor = { (aProps)=>{
                const chevronIconProps = {
                    size : 20,
                    icon : "chevron-down",
                    secondary : true,
                    ...customChevronIconProps,
                    ...aProps,
                    style : [styles.icon,withLabel=== false && {color:theme.colors.onPrimary},customChevronIconProps.style],
                }
                if(!withLabel){
                    return <Pressable testID={testID+"_AvatarContainer"} style={[theme.styles.row,theme.styles.alignItemsCenter,theme.styles.pr1]}>
                        <Image
                            pickImageProps = {{quality:0.4}}
                            {...props} 
                            {...aProps}
                            {...customProps}
                            size={size}
                            style = {styles.itemLeft}
                            testID = {testID+"_Avatar"}
                            readOnly = {false}
                            defaultSource ={avatarProps.defaultSrc}
                            onChange = {onChangeAvatar}
                        />
                        <Icon.Font
                            testID={testID+"_ChevronIcon"}
                            {...chevronIconProps}
                            {...aProps}
                            style = {[chevronIconProps.style,{marginLeft:-5}]}
                        />
                    </Pressable>
                }
                return <Pressable
                        testID={testID+"_ProfilAvatarContainer"}
                        normal
                        upperCase = {false}
                        disableRipple
                        title = {tooltip}
                        {...aProps}
                        style = {[styles.container]}
                        //surfaceProps = {{style:[theme.styles.noMargin,theme.styles.noPadding]}}
                        onLongPress = {onLongPress}
                    >
                        <Image
                            {...props} 
                            {...customProps}
                            size={size}
                            style = {styles.itemLeft}
                            testID = {testID+"_Avatar"}
                            readOnly = {false}
                            defaultSource ={avatarProps.defaultSrc}
                            onChange = {onChangeAvatar}
                        />
                        {children}
                        <Icon 
                            testID={testID+"_ChevronIcon"}
                            {...chevronIconProps}
                        />
                    </Pressable>
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
        flex : 1,
        flexDirection : "row",
        justifyContent : "start",
        alignItems : "center",
    },
    labelContainer : {
        flexDirection : 'column',
        paddingRight : 5,
        maxWidth : 140,
        minWidth : 100,
    },
    withNotLabel : {
        textAlign : "center",
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
    },
    notLabelHeader : {
        textAlign : "left",
        alignSelf :"flex-start"
    },
});

export default UserProfileAvatarComponent;

UserProfileAvatarComponent.displayName = "UserProfileAvatarComponent";

UserProfileAvatarComponent.propTypes = {
    renderedOnAppBar : PropTypes.bool,//spécifie si le profil avatar est rendu si true sur l'appBar, si false sur le drawer
    ...Object.assign({},Image.propTypes), //par défaut les props de l'image qui est utilisée pour le rendu de l'avatar
    withLabel : PropTypes.bool, //si le label sera affiché, ie, le nom où pseudo de l'utilisateur
    menuItems : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    /****
      La props customProps issue de la propriété {component:profilAvatarProps} de useContext, prend les propriétés suivatnes : 
      il peut s'agir d'une fonction où d'un objet. s'il s'agit d'une fonction alors la dite fonction est de la forme : 
      ({canSignOut<boolean>,renderedOnAppBar<boolean>,user<object>,....rest})=> <CustomAvatarProps>
      <CustomAvatarProps> : {
         ...Image.propTypes,
         size <number>,
         pseudo <string>, le pseudo à afficher
         label <string>, la chaine de caractère à afficher pour le rendu du label/FullName,
         menuItems : <Array<object> | object<object>>, les menu items personnalisés à utiliser pour l'affichage
      }
    */
}