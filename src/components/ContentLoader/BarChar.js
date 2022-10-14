import React from 'react'
import ContentLoader from './Loader';
import Rect from "./Rect";
import {getNumberOfLines} from "./utils";

const BarChart = props => {
  const lines = getNumberOfLines(props);
  return (
    <ContentLoader width={200} height={200} viewBox="0 0 200 200" {...props}>
      <Rect x="0" y="160" rx="0" ry="0" width="25" height="40" />
      <Rect x="30" y="145" rx="0" ry="0" width="25" height="55" />
      <Rect x="60" y="126" rx="0" ry="0" width="25" height="74" />
      <Rect x="90" y="80" rx="0" ry="0" width="25" height="120" />
      <Rect x="120" y="142" rx="0" ry="0" width="25" height="58" />
    </ContentLoader>
  )
}

export default BarChart