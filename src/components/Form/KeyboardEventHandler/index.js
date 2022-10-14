import React from 'react';
import PropTypes from 'prop-types';
import { findMatchedKey} from './keyEvents';
import View from "$components/View";
import {isWeb} from "$platform";

let exclusiveHandlers = [];

export default class KeyboardEventHandler extends React.Component {
  constructor(props) {
    super(props);

    this.registerExclusiveHandler = this.registerExclusiveHandler.bind(this);
    this.deregisterExclusiveHandler = this.deregisterExclusiveHandler.bind(this);
    this.childRef = React.createRef(null);
    Object.defineProperties(this,{
      events : {
        value : {
          onKeyEvent : this.handleKeyboardEvent.bind(this),
        }
      }
    })
  }
  isFilter(){
    return this.props.isFilter;
  }

  componentDidUpdate(prevProps) {
    const { isExclusive, isDisabled } = prevProps;
    const hasChanged = this.props.isExclusive !== isExclusive ||
      this.props.isDisabled !== isDisabled;

    if (hasChanged) {
      if (this.props.isExclusive && !this.props.isDisabled) {
        this.registerExclusiveHandler();
      } else {
        this.deregisterExclusiveHandler();
      }
    }
  }

  registerExclusiveHandler() {
    this.deregisterExclusiveHandler();
    exclusiveHandlers.unshift(this);
  }

  deregisterExclusiveHandler() {
    if (exclusiveHandlers.includes(this)) {
      exclusiveHandlers = exclusiveHandlers.filter(h => h !== this);
    }
  }

  handleKeyboardEvent(event) {
    const {
      isDisabled,disabled,readOnly, handleKeys, onKeyEvent, handleEventType, children, handleFocusableElements,
    } = this.props;
    if (isDisabled || disabled || readOnly) {
      return false;
    }
    const isEventTypeMatched = !handleEventType?true :  handleEventType === event.type;
    if (!isEventTypeMatched) {
      return false;
    }
    const isEligibleEvent = event.target === isWeb() && typeof document !=='undefined' && document.body ? document.body : handleFocusableElements;
    const isChildrenEvent = this.childRef.current && typeof this.childRef.current.contains =='function' && this.childRef.current.contains(event.target);
    const isValidSource = children ? isChildrenEvent : isEligibleEvent;
    if (!isValidSource) {
      return false;
    }
    const matchedKey = findMatchedKey(event, handleKeys);
    if (matchedKey) {
      event.formFieldName = this.props.formFieldName;
      event.testID = this.props.testID;
      onKeyEvent(matchedKey, event);
      return true;
    }

    return false;
  }

  render() {
    let { children,isFilter,innerRef,handleKeys,isDisabled,disabled, readOnly,onKeyEvent,handleEventType,handleFocusableElements,...rest} = this.props;
    rest = Object.assign({},rest);
    const events = isDisabled || disabled || readOnly || isFilter ? {} : {
      //onKeyDown : this.events.onKeyEvent,
      //onKeyUp : this.events.onKeyEvent,
      onKeyPress : this.events.onKeyEvent,
    }
    if(typeof children =='function'){
      children = children(events);
    }
    if(!React.isValidElement(children)) return null;
    return <View {...rest} ref={React.mergeRefs(this.childRef,innerRef)}>
      {children}
    </View>
  }
}

KeyboardEventHandler.propTypes = {
  handleKeys: PropTypes.array,
  handleEventType: PropTypes.oneOf(['keydown', 'keyup', 'keypress']),
  handleFocusableElements: PropTypes.bool,
  onKeyEvent: PropTypes.func,
  isDisabled: PropTypes.bool,
  isExclusive: PropTypes.bool,
  children: PropTypes.any,
};

KeyboardEventHandler.defaultProps = {
  handleKeys: [],
  handleFocusableElements: false,
  //handleEventType: 'keypress',
  handleEventType: undefined,
  onKeyEvent: () => null,
};