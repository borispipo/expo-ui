import React from 'react'
import ContentLoader from './Loader';
import Rect from "./Rect";
import { Dimensions} from 'react-native';

export const HEIGHT = 180;

const FormContentLoader = props => {
  const {width:winWidth} = Dimensions.get("window");
  const width = typeof props.width == 'number' && props.width ? props.width : winWidth - 100;
  const w6 = (width)/6, w3 = (width)/3, w2 = width/2;
  return (
    <ContentLoader
      {...props}
      height={HEIGHT}
      viewBox={"0 0 "+width+" "+HEIGHT}
      //backgroundColor="#d9d9d9"
      //foregroundColor="#ecebeb"
      width={width}
    >
      <Rect x="0" y="15" rx="4" ry="4" width={2*w6} height="15" />
      <Rect x={2*w6+25} y="15" rx="3" ry="3" width={2*w6} height="15" />
      <Rect x={4*w6+40} y="15" rx="3" ry="3" width={w6} height="15" />

      <Rect x="0" y="50" rx="4" ry="4" width={2*w6} height="15" />
      <Rect x={2*w6+25} y="50" rx="3" ry="3" width={w6} height="15" />
      <Rect x={3*w6+40} y="50" rx="3" ry="3" width={2*w6} height="15" />

      <Rect x="0" y="90" rx="4" ry="4" width={w3} height="15" />
      <Rect x={w3+25} y="90" rx="3" ry="3" width={w3} height="15" />
      <Rect x={2*w3+40} y="90" rx="3" ry="3" width={w3} height="15" />

      <Rect x="0" y="130" rx="4" ry="4" width={w2} height="15" />
      <Rect x={w2+25} y="130" rx="3" ry="3" width={w2} height="15" />
    </ContentLoader>
  )
}

export default FormContentLoader