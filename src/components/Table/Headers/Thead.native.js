import {forwardRef} from "react";

const TheadNativeTableComponent = forwardRef(({children},ref)=>{
  return children;
});

TheadNativeTableComponent.displayName ="TheadNativeTableComponent";

export default TheadNativeTableComponent;