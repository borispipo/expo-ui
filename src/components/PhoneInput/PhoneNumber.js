import _ from 'lodash';
import libPhoneNumber from 'google-libphonenumber';
import {isNonNullString,defaultStr} from "$cutils";

import Country from './country';
import numberType from './numberType.json'; // eslint-disable-line @typescript-eslint/no-unused-vars

const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
const asYouTypeFormatter = libPhoneNumber.AsYouTypeFormatter;

export {phoneUtil};

export const parse = (number,iso2)=>{
    try {
        return phoneUtil.parse(number, defaultStr(iso2).toLowerCase());
    } catch (err) {
        console.log(`Exception was thrown on parsing phone number : ${err.toString()}`);
        return null;
    }
}

export const isValidNumber = (number,iso2)=>{
    const phoneInfo = parse(number, defaultStr(iso2).toLowerCase());
    if (phoneInfo) {
        return phoneUtil.isValidNumber(phoneInfo);
    }
    return false;
}
export const isValidPhoneNumber = isValidNumber;

class PhoneNumber {
    // eslint-disable-next-line class-methods-use-this
    getAllCountries() {
        return Country.getAll();
    }

    getDialCode(number) {
        let dialCode = '';
        // only interested in international numbers (starting with a plus)
        if (number.charAt(0) === '+') {
            let numericChars = '';
            // iterate over chars
            for (let i = 0; i < number.length; i++) {
                const c = number.charAt(i);
                // if char is number
                if (this.isNumeric(c)) {
                    numericChars += c;
                    // if current numericChars make a valid dial code
                    // if (this.countryCodes[numericChars]) {
                    if (Country.getCountryCodes()[numericChars]) {
                        // store the actual raw string (useful for matching later)
                        dialCode = number.substr(0, i + 1);
                    }
                    // longest dial code is 4 chars
                    if (numericChars.length === 4) {
                        break;
                    }
                }
            }
        }
        return dialCode;
    }

    // eslint-disable-next-line class-methods-use-this
    getNumeric(str) {
        return str.replace(/\D/g, '');
    }

    // eslint-disable-next-line class-methods-use-this
    isNumeric(n) {
        return !Number.isNaN(parseFloat(n)) && Number.isFinite(Number(n));
    }

    getCountryCodeOfNumber(number) {
        const dialCode = this.getDialCode(number);
        const numeric = this.getNumeric(dialCode);
        const countryCode = Country.getCountryCodes()[numeric];

        // countryCode[0] can be null -> get first element that is not null
        if (countryCode) {
            return _.first(countryCode.filter((iso2) => iso2));
        }

        return '';
    }

    // eslint-disable-next-line class-methods-use-this
    parse(number, iso2) {
        return parse(number,defaultStr(iso2).toLowerCase());
    }

    isValidNumber(number, iso2) {
        return this.isValidNumber(number,defaultStr(iso2).toLowerCase());
    }

    // eslint-disable-next-line class-methods-use-this
    format(number, iso2) {
        const formatter = new asYouTypeFormatter(defaultStr(iso2).toLowerCase()); // eslint-disable-line new-cap
        let formatted;
        number.replace(/-/g, '')
            .replace(/ /g, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .split('')
            .forEach((n) => {
                formatted = formatter.inputDigit(n);
            });

        return formatted;
    }

    getNumberType(number, iso2) {
        const phoneInfo = this.parse(number, defaultStr(iso2).toLowerCase());
        const typeIndex = phoneInfo ? phoneUtil.getNumberType(phoneInfo) : -1;
        return _.findKey(numberType, (noType) => noType === typeIndex);
    }

    // eslint-disable-next-line class-methods-use-this
    getCountryDataByCode(iso2) {
        return Country.getCountryDataByCode(defaultStr(iso2).toLowerCase());
    }
}

export default new PhoneNumber();
