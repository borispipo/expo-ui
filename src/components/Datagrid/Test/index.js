// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import fields from "./fields";
import Table from "../Table";
import React from "$react";
import { faker } from '@faker-js/faker';
export default function TestDatagridComponent({count,...props}){
    const data = React.useMemo(()=>{
        count = typeof count =='number' && count > 10 ? count : 5000;
        return faker.helpers.multiple(createRandomUser, {
            count,
        });
    },[count])
    return <Table 
        title = "Utilisateurs"
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
        email : {
            type : "email",
            label : 'Email',
        },
        avatar : {
           type : "image",
           label: 'Avatar',
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
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.date.past(),
    };
  }