export default {
    enabled : false,//la gestion de l'authentification est désactivée par défaut
    loginPropsMutator : (props)=>props,//({object})=><{object}>, la fonction permettant de muter les props du composant Login,
    profilePropsMutator : ({fields,...props})=>({fields,...props}),//la fonction permettant de muter les champs liés à l'écran de mise à jour d'un profil utilisateur
    signIn : ({user})=>Promise.resolve({message:"Connecté avec success"}), //la fonction permettant de connecter un utilisateur
    signOut : ({user})=>Promise.resolve({message:"Déconnecté avec success"}),//la fonction permettant de déconnecter un utilisateur
    /**** permet de mettre à jour les informations sur un utilisateurs, informations venant des préférences de ce dernier */
    upsertUser: ({ user }) => Promise.resolve({message:`utilisateur mis à jour avec succèes`}),
    /***** permet de déterminer si l'utilisateur est un super admin */
    isMasterAdmin: (user) => {
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
	getUserFullName : (user)=> user.fullName || `${user.firstName && user.firstName ||''}${user.lastName && ` ${user.lastName}` ||''}`
}