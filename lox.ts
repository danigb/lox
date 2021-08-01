import { readLines } from "https://deno.land/std@0.76.0/io/bufio.ts";

import { scan } from "./src/scanner.ts";
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
  console.log("Write .exit to quit (or Ctrl+D).");
  for await (const line of readLines(Deno.stdin)) {
    if (line === ".exit") return;

    try {
      const program = line.endsWith(";") ? line : line + ";";
      const tokens = scan(program);
      const statements = parse(tokens);
      // console.log({ program, statements, tokens });
      interpreter.run(statements);
      console.log("> ");
    } catch (err) {
      console.log(">>> ", err.message);
    }
  }
}

async function runFiles(filenames: string[]) {
  for (const filename of filenames) {
    const program = await Deno.readTextFile(filename);
    const tokens = scan(program);
    const statements = parse(tokens);
    interpreter.run(statements);
  }
}
