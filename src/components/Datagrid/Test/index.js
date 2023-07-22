// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import fields from "./fields";
import Table from "../Table";
const data = require("./data.json");
export default function TestDatagridComponent({...props}){
    return <Table  columns={fields} data={data.docs} {...props}/>
}