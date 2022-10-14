import Fab from "$components/Fab";
import { StyleSheet } from "react-native";
import actions from "./actions";
import {isObjOrArray} from "$utils";
import {removeFabRef,createFabRef} from "./utils";
import PropTypes from "prop-types";
import APP from "$app";
import React from "$react";
import {sanitizeName} from "$screens/utils";

export * from "./utils";

const FABContainer = React.forwardRef((props,ref)=>{
   return null;
  const {state,actions:customActions,screenName,...rest} = props;
  const sScreenName = sanitizeName(screenName);
  ref = ref || createFabRef(screenName);
  React.useEffect(()=>{
    const onFocusFab = ({sanitizedName})=>{
        const isFocused = sanitizedName === sScreenName;
        if(isFocused && ref.current && ref.current.show){
            ref.current.show();
        }
    }, onBlurFab = ({sanitizedName})=>{
      const isBlured = sanitizedName == sScreenName;
      if(isBlured && ref.current && ref.current.hide){
        ref.current.hide();
      }
    }
    APP.on(APP.EVENTS.SCREEN_FOCUS,onFocusFab);
    APP.on(APP.EVENTS.SCREEN_BLUR,onBlurFab);
    return ()=>{
      APP.off(APP.EVENTS.SCREEN_FOCUS,onFocusFab);
      APP.off(APP.EVENTS.SCREEN_BLUR,onBlurFab);
      removeFabRef(screenName);
    }
  },[])
  return <Fab.Group
        {...rest}
        screenName = {screenName}
        ref = {ref}
        style={styles.fab}
        actions = {isObjOrArray(customActions) && Object.size(customActions,true)?customActions : actions()}
    />
});
const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  })

  export default FABContainer;

  FABContainer.propTypes = {
     screenName : PropTypes.string.isRequired,
  }
  FABContainer.displayName = "FABContainer";