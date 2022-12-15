// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {isObj,defaultNumber} from "$utils";
import appConfig from "$app/config";

/*** retourne le nombre maximal de courbes pouvant s'afficher sur un même graphe
 * exempt  du graphe de type pie/donut
 * par défaut, on peut afficher au maximum 5 courbes sur le même graphe
 */
export const getMaxSupportedSeriesSize = ()=>{
   const m = defaultNumber(appConfig.get("maxSupportedChartSeries"));
   return m > 3 ? m : 5;
}