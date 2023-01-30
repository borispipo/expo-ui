import React from '$react';
import { ScrollView} from 'react-native';
const ScrollViewComponent = React.forwardRef(({testID,...rest},ref) => {
  return <ScrollView testID={testID} ref={ref} {...rest}/>
});

ScrollViewComponent.displayName = "ScrollViewComponent";
export default ScrollViewComponent;

ScrollViewComponent.propTypes = {
   ...defaultObj(ScrollView.propTypes),
}
