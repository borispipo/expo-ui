import showConfirm from "$components/Dialog/confirm";
import notify from "$components/Dialog/notify";
import {defaultArray,arrayValueExists,defaultStr,uniqid} from "$cutils";
import userDbName from "$database/data/tables/users/dbName";
import Auth from "$auth";
import getData from "$database/getData";
import getDB from "$database/getDB";
import {FormData,getForm,getFormData} from "$components/Form";
import Icon from "$components/Icon";
import React from "$react";
import Label from "$components/Label";
import {open as showPreloader,close as hidePreloader} from "$preloader";
import Expandable from "$components/Expandable";
import theme from "$theme";
import View from "$components/View";
import Link from "$components/Link";
import Button from "$components/Button";

const tableName = Auth.permProfilesTableName.toUpperCase();

const PermProfile = React.forwardRef((props,ref)=>{
    const formName = React.useRef(defaultStr(props.formName,uniqid("perm-profile-name"))).current;
    const user = defaultObj(props.user);
    const permDataRef = React.useRef({});
    const dialogProviderRef = React.useRef(null);
    const {isMasterAdmin,text,label,editProfileRouteName} = props;
    const [state,setState] = React.useState({
        profiles : {},
        selected : defaultArray(user.permProfiles),
        loading : true,
        canAssignPerms : Auth.isTableDataAllowed({table:'users',action:'assignPerms'}),
        canViewPerms : Auth.isTableDataAllowed({table:'users',action:'readPerms'})
    });
    const {canAssignPerms,canViewPerms,selected} = state;
    const  reload = ()=>{
        getData(userDbName+"["+tableName+"]").then((profiles)=>{
            setState({...state,profiles,loading:false})
        }).catch((e)=>{
            setState({...state,loading:false})
        })
    }
    const assignProfile = (profile,select)=>{
        if(isMasterAdmin) return null;
        const {selected} = state;
        profile = defaultObj(profile);
        const sel = [];
        const allP = {};
        if(selected.length <= 0){
            if(select){
                sel.push(profile.code);
            }
        } else {
            for(let i in selected){
                const val = selected[i];
                if(selected[i] == profile.code){
                    if(select && !allP[profile.code]){
                        sel.push(profile.code);
                        allP[profile.code] = true;
                    }
                } else if(!allP[val]) {
                    sel.push(val);
                    allP[val] = true;
                }
            }
            if(select && !allP[profile.code]){
                sel.push(profile.code);
            }
        }
        setState({...state,selected:sel});
        if(props.onChange){
            props.onChange({context:{},...state,selected:sel});
        }
    }
    const onChange = ({data})=>{
        permDataRef.current = data;
    }
    const onSaveProfile = ({data,goBack})=>{
        const d = {...data,table:tableName,perms:permDataRef.current};
        if(!isNonNullString(d._id)) return;
        showPreloader()
        getDB(userDbName).then(({db})=>{
            db.upsert(d._id,()=>{
                return d;
            }).then((up)=>{
                let d = up.newDoc;
                notify.success("Le profil ["+d.code+"] a été inséré/modifié avec succès");
                reload();
                if(goBack){
                    goBack(true);
                }
                hidePreloader();
            }).catch((e)=>{
                console.log(e," upserting profile group");
                hidePreloader();
            });
        })
    }
    const removeProfile = (profile)=>{
        if(!isObj(profile) || !isNonNullString(profile.code) || !isNonNullString(profile._id)){
            return;
        }
        showConfirm({
            title:'Suppr profil['+profile.code+"]",
            msg : 'Voulez vous vraiment supprimer le profil <<'+profile.code+">>",
            onSuccess : ()=>{
                getDB(userDbName).then(({db})=>{
                    showPreloader('Suppression du profil '+defaultStr(profile.code)+"...");
                    db.get(profile._id).then((doc)=>{
                        db.remove(doc).then((e)=>{
                            hidePreloader();
                            notify.success("Le profil ["+profile.code+"] a été supprimé avec succès");
                            reload();
                        });
                    }).catch((e)=>{
                        console.log(e,' is removing doc profile')
                        hidePreloader();
                    })
                })
            }
        })
    }
    React.useEffect(()=>{
        if(!canAssignPerms && !canViewPerms) return;
        reload();
        return ()=>{

        }
    },[])
    if(!canAssignPerms && !canViewPerms) return null;
    const profiles = [];
    Object.map(state.profiles,(profile,index)=>{
        if(!isObj(profile) || !isNonNullString(profile.code)){
            return null;
        }
        const isAssigned = isMasterAdmin? true : arrayValueExists(selected,profile.code);
        profiles.push(<View key={index} style={[theme.styles.row,{justifyContent:'space-between'}]}>  
            <Label>{profile.code}</Label>
            <View style={[theme.styles.row]}>
                <Icon primary title={isAssigned?'Profil de permission ['+profile.code+'] assigné à l\'utilisateur':'Profil de permission ['+profile.code+'] non assigné à l\'utilisateur '+defaultStr(user.code)} name={isAssigned?'checkbox-marked':'checkbox-blank-outline'} 
                    onPress={()=>{
                        assignProfile(profile,isAssigned?false:true)
                    }}
                />
                {canAssignPerms ? <Link Component = {Icon}
                    title={"Modifier le profil ["+profile.code+"]"} 
                    name={"file-document-edit"} 
                    success
                    routeParams = {{data:profile,formName,onChange,onSave:onSaveProfile}}
                    routeName = {editProfileRouteName}
                />:null}
                {canAssignPerms ? <Icon 
                    title={"Supprimer le profil ["+profile.code+"]"} 
                    name={"delete"} 
                    error
                    onPress={(e)=>{
                        React.stopEventPropagation(e); 
                        removeProfile(profile);
                    }}
                /> : null}
            </View>
        </View>)
    })
    return <Expandable title={defaultStr(label,text)+" ("+profiles.length.formatNumber()+")"} style={[theme.styles.p1]}>
            <Link 
                primary
                Component = {Button}
                routeName = {editProfileRouteName}
                routeParams = {{formName,onChange,onSave:onSaveProfile}}
                icon={"text-box-plus-outline"}
                mode = "contained"
            >
                    Ajouter un profil                        
            </Link>
            <View style={[theme.styles.w100]}>
                {profiles}
            </View>
    </Expandable>
});

PermProfile.tableName = PermProfile.table = tableName;
PermProfile.dbName = userDbName;
export default PermProfile;