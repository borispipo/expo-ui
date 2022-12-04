import allCountries from "./resources/countries.json";
import {get as getFlag} from "./resources/flags";
import {orderBy} from 'lodash';
import { StyleSheet } from "react-native";

export const COUNTRIES = {};

export const getAll = (options)=>{
    return orderBy(
        allCountries, // eslint-disable-line global-require
        ['name'],
        ['asc'],
    ).map((country, index) => {
        const c = {
            key: index,
            image: getFlag(country.iso2),
            label: country.name,
            dialCode: `+${country.dialCode}`,
            iso2: country.iso2,
            code : country.iso2,
            isoCode : country.iso2,
        };
        COUNTRIES[country.iso2.toUpperCase().trim()] = c;
        return c;
    });
}

export const countries = getAll();


export {getFlag};

export const getCountry = (code)=>{
    if(!code || typeof code !=='string') return null;
    code = code.toUpperCase().trim();
    return COUNTRIES[code] || null;
}

export const styles = StyleSheet.create({
    renderedImage : {
        flexDirection : "row",
        alignItems : 'center',
        justifyContent : 'flex-start',
        flex : 1,
    },
    flagImage : {
        borderWidth:0,
        width : 30,
        height : 20,
    },
})