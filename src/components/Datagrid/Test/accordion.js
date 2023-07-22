// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import Label from "$ecomponents/Label";
let multiplicater = require("./multiplicater");
import DateLib from "$date";
export default (args,from,to) =>{
    let {rowData}= args;
    rowData = defaultObj(rowData);
    let cost = multiplicater({rowData,columnField:'cost'},from,to);
    let tbFrom = "",tbTo = "",typeText = "";
    let label = defaultStr(rowData.label)
    let labelT = label;
    if(label.length >250){
        labelT = label.substring(0,245)+"...";
    }
    switch(rowData.type){
        case "PSA":
            tbFrom = "THIRD_PARTIES";
            tbTo = "CHECKOUTS";
            typeText = "Vente";
            break;
        case "PPU":
            tbTo = "THIRD_PARTIES";
            tbFrom = "CHECKOUTS";
            typeText = "Achat";
            break;
        case "PDE":
            tbTo = "THIRD_PARTIES";
            tbFrom = "CHECKOUTS";
            typeText = "Décaissement";
            break;
        case "PTR":
            tbFrom = "CHECKOUTS";
            tbTo = "CHECKOUTS";
            typeText = "Transfert";
            break;
        case "PIN":
            tbFrom = "THIRD_PARTIES";
            tbTo = "CHECKOUTS";
            typeText = "Encaissement";
    }
    if(typeText){
        typeText = "["+typeText+"]"
    }
    if(cost > 0){
        cost = cost.formatMoney();
    } else cost = undefined;

    return {
        title : <div className="accordion-payment">
            <Label
                dbName={rowData.dbId}
                table = {"PAYMENTS"}
                _id = {rowData.code}
            >
                {typeText.toUpperCase()+" "+rowData.code}
            </Label>
        </div>,
        content : <div>
            {tbFrom && <Label
                dbName={"common"}
                table = {tbFrom}
                _id = {tbFrom+"/"+rowData.from}
            >
                {rowData.from}
            </Label>}
            {tbFrom && tbTo && " => "}
            {tbTo && <Label
                dbName={"common"}
                table = {tbTo}
                _id = {tbTo+"/"+rowData.to}
            >
                {rowData.to+", "}
            </Label>}
            <span>{DateLib.format(rowData.date,DateLib.defaultDateFormat)+(rowData.mode?(" ["+rowData.mode+"]"):"")+
            (cost? ((", Coût : ").toUpperCase()+cost):"")}</span>
        </div>,
    }
}