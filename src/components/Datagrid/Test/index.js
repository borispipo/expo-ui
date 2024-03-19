// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Table from "../IndexComponent";
import React from "$react";
import { faker } from '@faker-js/faker';
import DateLib from "$clib/date";
export default function TestDatagridComponent({count,...props}){
    const data = React.useMemo(()=>{
        count = typeof count =='number' && count > 5 ? count : 10000;
        return faker.helpers.multiple(createRandomUser, {
            count,
        });
    },[count])
    return <Table 
        title = "Utilisateurs"
        sessionName="datagrid-test-data"
        accordion = {({rowData})=>{
            return {
                content : `${rowData.email}`,
                title : rowData?.username,
                avatar : rowData.avatar,
                right : DateLib.format(rowData.birthdate),
            }
        }}
    columns={{
        userId : {
            primaryKey : true,
            text :"Id",
            width : 100,
        },
        username : {
            text : "Name",
            width : 220,
        },
        amount : {
            type : "number",
            label : "Amount",
        },
        email : {
            type : "email",
            label : 'Email',
        },
        avatar : {
           type : "image",
           label: 'Avatar',
           withLabel : false,
           size : 120,
           datagrid : {
            size : 50,
           }
        },
        birthdate : {
            type : "date",
            label : "Date",
        },
    }} data={data} {...props}/>
}

export function createRandomUser (){
    return {
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
      amount : faker.number.int(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.date.past(),
    };
  }