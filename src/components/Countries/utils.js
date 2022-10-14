import allCountries from "./resources/countries.json";
import {get as getFlag} from "./resources/flags";
import {orderBy} from 'lodash';

export const getAll = (options)=>{
    return orderBy(
        allCountries, // eslint-disable-line global-require
        ['name'],
        ['asc'],
    ).map((country, index) => ({
        key: index,
        image: getFlag(country.iso2),
        label: country.name,
        dialCode: `+${country.dialCode}`,
        iso2: country.iso2,
        code : country.iso2,
        isoCode : country.iso2,
    }));
}

export const countries = getAll();

export {getFlag};

export const getCountry = (code)=>{
    if(!code || typeof code !=='string') return null;
    return countries.find((c) => c.code === code)
}