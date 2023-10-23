import {forwardRef} from "react";

const TheadWebTableComponent = forwardRef((props,ref)=>{
  return <thead {...props} ref={ref}/>
});

TheadWebTableComponent.displayName ="TheadWebTableComponent";

export default TheadWebTableComponent;