import {default as Scanner} from "./Scanner";
import {default as Generator} from "./Generator";
import {default as Designer} from "./Designer";
import { generate } from "./utils";
export * from "./Scanner";
export * from "./Generator";
export * from "./Designer";
export * from "./utils";

Scanner.Generator = Generator;
Scanner.Designer = Designer;
Scanner.generate = generate;

export default Scanner;

export {Generator,Scanner,Designer};