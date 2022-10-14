import React from 'react'
import ContentLoader from './Loader';
import Rect from "./Rect";
import { Dimensions} from 'react-native';

export const HEIGHT = 160;

const DatagridContentLoader = props => {
  const {width:winWidth} = Dimensions.get("window");
  const width = typeof props.width == 'number' && props.width ? props.width : winWidth - 100;
  return (
    <ContentLoader
      {...props}
      height={HEIGHT}
      viewBox={"0 0 "+width+" "+HEIGHT}
      //backgroundColor="#d9d9d9"
      //foregroundColor="#ecebeb"
      width={width}
    >
        <Rect x="0" y="0" rx="1" ry="1" width={width} height="15" />
        <Rect x="0" y="30" rx="1" ry="1" width={width-80} height="15" />
        <Rect x="0" y="60" rx="1" ry="1" width={width-100} height="15" />
        <Rect x="0" y="90" rx="1" ry="1" width={width} height="15" />
    </ContentLoader>
  )
}

export default DatagridContentLoader