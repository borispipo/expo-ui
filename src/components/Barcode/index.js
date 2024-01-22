import {default as Scanner} from "./Scanner";
import {default as Generator} from "./Generator";
export * from "./Scanner";
export * from "./Generator";

Scanner.Generator = Generator;

export default Scanner;

export {Generator,Scanner};