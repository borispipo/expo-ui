// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultNumber} from "$utils";
export const methodsNames = ["updateOptions","updateSeries","destroy","render","exec","appendSeries","toggleSeries","showSeries","hideSeries","zoomX","resetSeries","appendData","toggleDataPointSelection","addXaxisAnnotation","addYaxisAnnotation","addPointAnnotation","removeAnnotation","clearAnnotations","dataURI","clearAnnotations",""];

export const destroyChart = (chartContext,timeout)=>{
    if (chartContext && typeof chartContext =='object' && typeof chartContext.destroy === 'function') {
        setTimeout(()=>{
          try {
            chartContext.destroy();
          } catch{}
        },defaultNumber(timeout,1000));
    }
}