import React from '$react';
import { ScrollView} from 'react-native';
import PropTypes from "prop-types";

const ScrollViewComponent = React.forwardRef(({withAutoSizer,autoSizerProps,testID,...rest},ref) => {
  return <ScrollView testID={testID} {...rest} ref={ref}/>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
   ...defaultObj(ScrollView.propTypes),
   withAutoSizer : PropTypes.bool,//si le contenu du scrollView sera wrap par le composant AutoSizer
   maxHeight : PropTypes.number,
   minHeight : PropTypes.number,
}
