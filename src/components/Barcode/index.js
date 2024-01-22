import {default as Scanner} from "./Scanner";
import {default as Generator} from "./Generator";
import {default as Designer} from "./Designer";
export * from "./Scanner";
export * from "./Generator";
export * from "./Designer";

Scanner.Generator = Generator;
Scanner.Designer = Designer;

export default Scanner;

export {Generator,Scanner,Designer};