import Panel from './Panel';
import {defaultBool} from "$utils";
import Dialog from "$ecomponents/Dialog";
import React from '$react';
import PropTypes from "prop-types";
import {defaultObj} from "$utils";
export default function PanelComponent(props){
    let  {autoClear,trim,dialogProps,visible,descriptionText,description,text,onComplete,...rest} = props;
    dialogProps = defaultObj(dialogProps);
    rest = defaultObj(rest);
    const ref = React.useRef();
    // Called after ref.current.readPanel() reads a non-empty base64 string
    const handleOK = (signature) => {
      console.log(signature);
      //onOK(signature); // Callback from Component props
    };
    return (
      <Dialog.Controlled 
        {...dialogProps}
        visible={visible}
        fullScreen
        title = {defaultStr(dialogProps.title,"Désigner une image")}
        actions ={[
            {
                text : "Sauvegarder",
                icon : "done",
                onPress : ()=>{
                    console.log("will save hein")
                }
            },
            {
                text : "Réinitialiser",
                icon : "notification-clear-all",
                onPress : ()=>{
                    console.log("will refresh hein")
                }
            },
            {
                text : "Options du crayon",
                icon : "settings-outline",
                onPress : ()=>{
                    console.log("will change settings")
                }
            },
            trim ? undefined : {
                text : "Couleur arrière plan",
                icon : "format-color-fill",
                onPress : ()=>{
                    console.log("will change bg color")
                },
            },
        ]}
      >
          <Panel
            {...rest}
            ref={ref}
            onOK={handleOK}
            autoClear={defaultBool(autoClear,true)}
            descriptionText={defaultStr(descriptionText,description,text)}
          />
      </Dialog.Controlled>
    );
}

PanelComponent.propTypes = {
    ...defaultObj(Panel.propTypes),
    dialogProps : PropTypes.object,
    visible : PropTypes.bool, //si le dialog sera visible ou pas
}