/***@see : https://github.com/alimek/react-native-tooltip-menu */
import React, {useRef, useMemo, useState } from 'react';
import PropTypes from "prop-types";
import theme,{ StyleProps} from '$theme';
import {defaultObj} from "$cutils";
import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import {
  Modal,
  Animated,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';

const INDENT = 30;
const PADDING = 5;
const ARROW_SIZE = 10;

const TooltipPopoverComponent = React.forwardRef(({
  children,
  content,
  //style,
  overlayStyle,
  widthType,
  modalButtonStyle,
  onRequestClose,
  onLayout,
  trianglePosition,
  ...rest
},ref) => {
  const buttonRef = useRef(null);
  const innerRef = React.useMergeRefs(ref,buttonRef);
  const [state,setState] = useState({
    componentPosition : null,
    isModalOpen : false,
  })
  const opacity = useMemo(() => new Animated.Value(0), []);
  const {isModalOpen,componentPosition,innerContentLayout} = state;
  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  const toggleModal = () => {
    if(!isModalOpen){
      if(!buttonRef.current || !buttonRef.current.measureInWindow) return;
      return buttonRef.current.measureInWindow((x, y,width,height,pageX,pageY) => {
        if(typeof x !=='number' || typeof y !=='number') return;
          setState({...state,
            isModalOpen : true,
            componentPosition:{
              x,
              y,
              width,
              height,
            }
          })
      });
    };
    setState({...state,isModalOpen:false});
  };

  const openModal = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(toggleModal);
  };

  const hideModal = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(toggleModal);
  };

  const handleClick = (onClickItem) => {
    const method = isModalOpen ? hideModal : openModal;
    method();

    onClickItem();
  };
  trianglePosition = 'center';
  const arrowStyle = {color:theme.colors.primary};
  const containerStyle = {};
  if(componentPosition){
     containerStyle.top = componentPosition.y;
     containerStyle.left = componentPosition.x;
  }
  let left, top ;
  if(innerContentLayout && componentPosition){
     const {width:contentWidth,height:contentHeight} = innerContentLayout;
     const {width:componentWidth,height:componentHeight,x:componentLeft,y:componentTop} = componentPosition;
     let spaceTop = componentTop, spaceBottom = windowHeight - componentHeight - componentTop,
     spaceLeft = componentLeft, spaceRight = windowWidth - componentWidth - componentLeft;
     ///on évalue la position du tooltip : 
     if(spaceBottom - contentHeight >= INDENT){   
        ///on va positionner le tooltip dans l'espace bas , le triangle va regarder en haut
        arrowStyle.top = componentTop + componentHeight;
        top = arrowStyle.top + ARROW_SIZE;
        arrowStyle.borderTopWidth = 0;
        arrowStyle.borderBottomColor = theme.colors.primary;
     } else if(spaceTop - contentHeight >= INDENT) {
       ///peut positionner le tooltip en haut du bouton, le triangle va regarder le bas
       arrowStyle.top = componentTop - componentHeight;
       top = arrowStyle.top - ARROW_SIZE;
       arrowStyle.borderBottomWidth = 0;
       arrowStyle.borderTopColor = theme.colors.primary;
     } else {
        top = 0;
        arrowStyle.display = "none";
        left = 0;
     }
     if(arrowStyle.display != "none"){
      arrowStyle.left = componentLeft + componentWidth/2 - ARROW_SIZE/2; 
      if(componentWidth >= contentWidth){
          left = arrowStyle.left - contentWidth/2+ ARROW_SIZE;
      } else {
        if(spaceLeft - contentWidth > INDENT){
            left = componentLeft - contentWidth;
        } else if(spaceRight - contentWidth > INDENT){
            left = componentLeft;
        } else {
          left = 0;
        }
      }
      
     }
     //on peut positionner le tooltip en bas du bouton, on vérifie la position du triangle
  }
  if(typeof top =='number'){
     containerStyle.top = top;
  }
  if(typeof left ==='number'){
    containerStyle.left = left;
  }
  const onInnerContentLayout = ({nativeEvent:{layout}}) => {
    if (layout.width === 0 || layout.height === 0) {
      return;
    }
    setState({...state,innerContentLayout:layout});
  }
  const cProps = {
    ...defaultObj(rest),
    onLongPress : openModal,
    onLayout,
  }
  const modalContent = <Modal visible={isModalOpen} transparent onRequestClose={(a)=>{
    if(onRequestClose && onRequestClose(a)=== false) return;
    hideModal();
  }}>
        <View style={[styles.overlay, overlayStyle]} />
        <Pressable
          activeOpacity={1}
          style={[{ flex: 1 }, modalButtonStyle]}
          onPress={hideModal}
        >
          <View
            style={[
              styles.component,
              {width:'100%',height:'100%'},
              containerStyle,
            ]}
          >
            <Pressable onPress={isModalOpen ? hideModal : openModal}>
                  <View
                    style={[styles.innerContainer]}
                  >
                  <Label 
                    onLayout={onInnerContentLayout} 
                    style={[{color:theme.colors.primaryText,backgroundColor:theme.colors.primary,padding:10,borderRadius:5}]}>{content}</Label>
              </View>
            </Pressable>
          </View>
          <Animated.View
            style={[
              styles.triangle,
              { opacity },
              arrowStyle,
            ]}
          />
        </Pressable>
      </Modal>;
  if(typeof children =='function'){
      return <>
          {<Label>{children(cProps,innerRef)}</Label>}
          {modalContent}
      </>
  }
  return <Pressable
      {...cProps}
      ref={innerRef}
    >
      <Label>{children}</Label>
      {modalContent}
    </Pressable>
});

TooltipPopoverComponent.defaultProps = {
  widthType: 'auto',
  onRequestClose: undefined,
  trianglePosition: 'center',
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tooltipMargin: {
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  innerContainer: {
    backgroundColor: 'transparent',
    flexGrow : 0,
    flexShrink : 0,
    alignItems: 'flex-start'
  },
  component: {
    position: 'absolute',
  },
  triangle: {
    position: 'absolute',
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});

TooltipPopoverComponent.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      /*** si children est une fonction alors elle doit retourner un composant de type Pressable */
      PropTypes.func,
    ]),
    style : StyleProps,
    overlayStyle: StyleProps,
    labelContainerStyle: StyleProps,
    modalButtonStyle: StyleProps,
    labelStyle: StyleProps,
    onRequestClose : PropTypes.func,
}

export default TooltipPopoverComponent;