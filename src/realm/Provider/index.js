import useExpoUI from "$econtext";
import React from "$react";

export default function ExpoUIRealmProvider({children,...props}){
  return children;
  const {realm:{RealmProvider,Provider}} = useExpoUI();
    RealmProvider = React.isComponent(RealmProvider)? RealmProvider : React.isComponent(Provider)?Provider : null;
    if(!RealmProvider){
        throw "Vous devez definir le provider realm de l'application, dans l'objet real de la fonction registerApp de $expo-ui";
    }
    return <RealmProvider>{children}</RealmProvider>
}
