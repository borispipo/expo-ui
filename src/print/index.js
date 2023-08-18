
import $session from "$session";
import {isDOMElement} from "$cutils/dom";
let formatField = require("../exporter/formatField");
let {outlineText} = require("./svg");
let printingPageFormats = {};

/*** vérifie si le contenu désiré pour l'impression est valide */

import createPDF from ("./createPDF");
import notify from "$cnotify";

module.exports = printTB;
