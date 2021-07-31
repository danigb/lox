import { readLines } from "https://deno.land/std@0.76.0/io/bufio.ts";

import { Scanner } from "./src/scanner.ts";
import { parse } from "./src/parser.ts";
import { Interpreter } from "./src/interpreter.ts";

const filenames = Deno.args;
const interpreter = new Interpreter();

if (filenames.length === 0) {
  repl();
} else {
  runFiles(filenames);
}

async function repl() {
  console.log("> ");
  for await (const line of readLines(Deno.stdin)) {
    const program = line.endsWith(";") ? line : line + ";";
    const tokens = new Scanner(program).scanTokens();
    const statements = parse(tokens);
    // console.log({ program, statements, tokens });
    interpreter.run(statements);
    console.log("> ");
  }
}

async function runFiles(filenames: string[]) {
  for (const filename of filenames) {
    const program = await Deno.readTextFile(filename);
    const tokens = new Scanner(program).scanTokens();
    const statements = parse(tokens);
    interpreter.run(statements);
  }
}
