import React from "$react";
import DateLib from "$clib/date";

export default function accordion({rowData}){
    return {
        content : `${rowData.email}`,
        title : rowData?.username,
        avatar : rowData.avatar,
        right : DateLib.format(rowData.birthdate),
    }
}