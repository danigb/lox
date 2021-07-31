import { Scanner } from "./src/scanner.ts";
import { parse } from "./src/parser.ts";

const filenames = Deno.args;
for (const filename of filenames) {
  const text = await Deno.readTextFile(filename);
  const scanner = new Scanner(text);
  const ast = parse(scanner.scanTokens());
  console.log(ast);
}
