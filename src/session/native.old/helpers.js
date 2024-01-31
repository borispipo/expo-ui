// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export const handleError= function (func, param) {
  let message;
  if (!param) {
    message = func;
  } else {
    message = `${func}() requires at least ${param} as its first parameter.`;
  }
  console.warn(message); // eslint-disable-line no-console
  return Promise.reject(message);
}
