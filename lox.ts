import { Scanner } from "./src/scanner.ts";

const filenames = Deno.args;
for (const filename of filenames) {
  const text = await Deno.readTextFile(filename);
  const scanner = new Scanner(text);
  console.log(scanner.scanTokens());
}
