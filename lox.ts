import { Scanner } from "./src/scanner.ts";
import { parse } from "./src/parser.ts";
import { interpret } from "./src/interpreter.ts";

const filenames = Deno.args;
for (const filename of filenames) {
  const text = await Deno.readTextFile(filename);
  const scanner = new Scanner(text);
  const ast = parse(scanner.scanTokens());
  const value = interpret(ast);
  console.log(value);
}
