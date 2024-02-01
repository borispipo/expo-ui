// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const dir =  path.join(__dirname,"src","components","Countries","resources");
const countries = require(path.join(dir,"countries.json"));

const normalized = [];
const normalizedSQL = [];
const exportedCountries = [];

for(let i in countries){
    const country = countries[i];
    if(!country || !country.name || !country.iso2 || typeof country.iso2 !='string') continue;
    const code = country.iso2.toUpperCase().trim();
    const c = {
        code,
        name : country.name,
        dialCode : country.dialCode,
    };
    exportedCountries.push({
        ...country,
        iso2 : code,
        ...c,
    })
    normalized.push(c);
    normalizedSQL.push("("+escapeQuotes(c.code)+","+escapeQuotes(c.name)+","+escapeQuotes(c.dialCode)+")")
}
writeFile(path.join(dir,"countries-normalized.json"),JSON.stringify(exportedCountries, null, 2))
writeFile(path.join(dir,"countries.sql"),"INSERT INTO countries(code,name,dialCode) \n\tVALUES \n\t\t"+normalizedSQL.join(",\n\t\t"))
writeFile(path.join(dir,"countries-with-not-extra.json"),JSON.stringify(normalized, null, 2))

function writeFile(path, contents, cb) {
    const p = require('path').dirname(path);
    if(!fs.existsSync(p)){
       try {
          fs.mkdirSync(p,{ recursive: true});
       } catch(e){}
    }
    if(fs.existsSync(p)){
      return fs.writeFileSync(path, contents, cb);
    }
    throw {message : 'impossible de créer le repertoire '+p};
  }

  function escapeQuotes (str){
    if(!str || typeof str !='string') return "''";
    return "'"+str.replace(/'/g, "\\'\\'")+"'";
  }