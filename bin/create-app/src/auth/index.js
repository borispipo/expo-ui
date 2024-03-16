export default {
    enabled : false,//la gestion de l'authentification est désactivée par défaut
    profilePropsMutator : ({fields,...props})=>({fields,...props}),//la fonction permettant de muter les champs liés à l'écran de mise à jour d'un profil utilisateur
    signIn : ({user})=>Promise.resolve({message:"Connecté avec success"}), //la fonction permettant de connecter un utilisateur
    signOut : ({user})=>Promise.resolve({message:"Déconnecté avec success"}),//la fonction permettant de déconnecter un utilisateur
    /**** permet de mettre à jour les informations sur un utilisateurs, informations venant des préférences de ce dernier */
    upsertUser: ({ user }) => Promise.resolve({message:`utilisateur mis à jour avec succèes`}),
    /***** permet de déterminer si l'utilisateur est un super admin */
    isMasterAdmin: (user) => {
        return true;//par défaut les utilisateurs sont master admin, c'est a dire ont le plain pouvoir sur l'application
        return !!user?.isMasterAdmin;
    },
    //retourne le mail de l'utilisateur s'il y a en a
    getUserEmail: (user) => user.email,
    /*** retourne le code d'utilisateur, alis si un code est utilisé pour identifier l'utilisateur de façon unique, par exemple son pseudo*/
    getUserCode: (user) => {
        return user?.userId || user?._id;
    },
    /*** retourne l'id unique de l'utilisateur */
    getLoginId: (user) => {
        return user.id;
    },
    //retourne le pseudo de l'utilisateur, s'il y en a
    getUserPseudo: (user) => user.pseudo,
	getUserFirstName : (user)=>user.firstName,
	getUserLastName : (user)=>user.lastName,
	getUserFullName : (user)=> user.fullName || `${user.firstName && user.firstName ||''}${user.lastName && ` ${user.lastName}` ||''}`,
	
	/****
	    Le composant à définir pour override le composant Login par défaut de l'application. example : Login : (porps)=><React.Component {...props}/>
        Pour override l'interface de connexion par défaut, vous dévez définir le contenu de cette propriété comme étant un composant React qui sera rendu 
        rendu en lieu et place du composant de connexion par défaut : Ce composant aura comme props : 
        {
            withPortal : {boolean}, //si le contenu de l'écran doit être rendu dans un portal
            onSuccess <function> : (data)=><any>, la fonction appelée en cas de success
            appBarProps <object>, les props à passer au composant ApppBar de l'écran de connexion, lorsque withPortal est à true
            auth <object>, //le composant auth récupérer à l'aide du hook useAuth de $cauth. définit les fonctions suivantes : 
            {
                signIn : (data)=><Promise>, la fonction permettant de connecter l'utilisateur
                signOut : ()=><Promise>, la fonction permettant de déconnecter l'utilisateur, /
                ...rest,
            }
        }
    */
    Login : null,
    /*
        la fonction loginPropsMutator de muter les props du composant Login par défaut, prise en compte lorsque le composant de connexion n'est pas remplacer par celui définit dans la prop login,
        @param {object} props : les propriétés de la fonction login, les props ont des propriétés suivantes : 
        {
            onSuccess : ({object})=><Any>, la fonction appelée en cas de success
            setState : (newState)=>(...newState),//la fonction utilisée pour update le state du composant. elle doit remplacer le state du composant
            state : <Object: data,...rest>, le state actuel à l'instant t du composant
            nextButton : <Object : 
                {
                    ref : nextButtonRef, //la référence vers le bouton next (le boutn Suivant)
                    isDisabled : x=> typeof buttonRef?.current?.isDisabled ==="function" && buttonRef.current?.isDisabled(),
                    enable : x=>typeof buttonRef?.current?.enable =="function" && buttonRef.current.enable(),
                    disable : x=> typeof buttonRef?.current?.disable =="function" && buttonRef?.current.disable(),
                }
            >,
            prevButton : <Object : 
                {
                    ref : prevButtonRef, //la référence react ver le buton previous (le bouton Précédent)
                    isDisabled : x=> typeof buttonRef?.current?.isDisabled ==="function" && buttonRef.current?.isDisabled(),
                    enable : x=>typeof buttonRef?.current?.enable =="function" && buttonRef.current.enable(),
                    disable : x=> typeof buttonRef?.current?.disable =="function" && buttonRef?.current.disable(),
                }
            >,
            showError <function> : (message,title)=><void>, la fonction permettant de notifier l'utilisateur en cas d'erreur
            getData <function> : ()=><Object>, la fonction permettant de récupérer les données en cours de modification du formulaire de connextion à l'instant t
            focusField <function> : (fieldName)=><void>, la fonction permettant d'activer le focus sur le champ fieldName à l'instant t
            formName <string>, //le nom du formulaire Form, passé à la formData
            nextButtonRef <{current:<any>}>, la référence vers le bouton next
            previousButtonRef <{current:<any>}, la référence vers le bouton previous
        }   
        @return <{object}>, l'objet a retourné doit être de la forme : 
        {
            headerTopContent : <ReactComponent | ReactNode, le contenu a afficher au headerTop de l'interface de connexion
            header : <ReactComponent| ReactNode>, le contenu du qui sera rendu immédiatement après le composant Header, par défaut, le texte "Connectez vous svp est affiché". Ce contenu doit être rendu si l'on souhaite override le texte "Connectez vous SVP" 
            containerProps : <object>, les props du composant <Surface/>, le composant qui est le wrapper du composant FormData en charge de récupérer les données de l'interface de connexion
            withHeaderAvatar : <boolean>, si l'avatar ou l'iconne de connexion sera afficher à l'interface de connexion par défaut
            canSubmit : ({step,...rest})=> <boolean>, //si les donées du formulaire peuvent être submit
            beforeSubmit : ({step,data,...rest})=><void>, //la fonction appélée immédiatement avant le submit des donénes
            ...loginProps {object}, les props Supplémentaires à passer au composant FormData utilisé pour le rendu du formulaire de connexion
        }
    */
    loginPropsMutator : (props)=>{
        return props;
    },
}