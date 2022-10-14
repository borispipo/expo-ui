import React from "$react";

export const defaultName = "FAB-REF-DEFAULT-NAME";

export const  FAB_CONTAINER_REFS = {};

export const createFabRef = (screenName)=>{
  screenName = typeof screenName =='string' && screenName ? screenName : defaultName;
  const ref = React.useRef(null);
  React.useEffect(()=>{
      FAB_CONTAINER_REFS[screenName] = ref.current;
  },[ref.current])
  return ref;
};
export const getFabRef = screenName => {
    screenName = typeof screenName =='string' && screenName ? screenName : defaultName;
    return FAB_CONTAINER_REFS[screenName] || null;
}; 

export const FAB_REFS = FAB_CONTAINER_REFS;

export const removeFabRef = (screenName)=>{
  screenName = screenName && typeof screenName =='string'? screenName : defaultName;
  delete FAB_CONTAINER_REFS[screenName];
}