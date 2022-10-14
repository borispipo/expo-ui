import * as React from "react";
let appBarRef = null;

export {appBarRef};

export const createAppBarRef = ()=>{
    const ref = React.useRef(null);
    React.useEffect(()=>{
        appBarRef = ref.current;
    },[ref.current]);
    return ref;
}