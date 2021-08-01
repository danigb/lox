import { reportError, LexError } from "./errors.ts";
import { Token, TokenType, TokenValue, newToken } from "./tokens.ts";

class ScanError extends LexError {}

function error(line: number, cause: string) {
  const error = new ScanError(line, "", cause);
  reportError(error);
  return error;
}

const KEYWORDS: Record<string, TokenType> = {
  and: "AND",
  class: "CLASS",
  else: "ELSE",
  false: "FALSE",
  for: "FOR",
  fun: "FUN",
  if: "IF",
  nil: "NIL",
  or: "OR",
  print: "PRINT",
  return: "RETURN",
  super: "SUPER",
  this: "THIS",
  true: "TRUE",
  var: "VAR",
  while: "WHILE",
} as const;

export function scan(source: String) {
  const tokens: Token[] = [];
  let start = 0;
  let current = 0;
  let line = 1;

  while (!isAtEnd()) {
    // We are at the beginning of the next lexeme.
    start = current;
    scanToken();
  }

  tokens.push(newToken("EOF", "", null, line));
  return tokens;

  function scanToken(): void {
    const char = advance();
    switch (char) {
      case "(":
        addToken("LEFT_PAREN");
        break;
      case ")":
        addToken("RIGHT_PAREN");
        break;
      case "{":
        addToken("LEFT_BRACE");
        break;
      case "}":
        addToken("RIGHT_BRACE");
        break;
      case ",":
        addToken("COMMA");
        break;
      case ".":
        addToken("DOT");
        break;
      case "-":
        addToken("MINUS");
        break;
      case "+":
        addToken("PLUS");
        break;
      case ";":
        addToken("SEMICOLON");
        break;
      case "*":
        addToken("STAR");
        break;
      case "!":
        addToken(match("=") ? "BANG_EQUAL" : "BANG");
        break;
      case "=":
        addToken(match("=") ? "EQUAL_EQUAL" : "EQUAL");
        break;
      case "<":
        addToken(match("=") ? "LESS_EQUAL" : "LESS");
        break;
      case ">":
        addToken(match("=") ? "GREATER_EQUAL" : "GREATER");
        break;

      case "/":
        if (match("/")) {
          // A comment goes until the end of the line.
          while (peek() != "\n" && !isAtEnd()) advance();
        } else {
          addToken("SLASH");
        }
        break;

      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        line++;
        break;

      case '"':
        processString();
        break;

      default:
        if (isDigit(char)) {
          processNumber();
        } else if (isAlpha(char)) {
          processIdentifier();
        } else {
          error(line, "Unexpected character.");
        }
    }
  }

  // Process complex constructs
  function processString(): void {
    while (peek() != '"' && !isAtEnd()) {
      if (peek() == "\n") line++;
      advance();
    }

    if (isAtEnd()) {
      error(line, "Unterminated string.");
      return;
    }

    // The closing ".
    advance();

    // Trim the surrounding quotes.
    const value = source.substring(start + 1, current - 1);
    addToken("STRING", value);
  }

  function processNumber(): void {
    while (isDigit(peek())) advance();

    // Look for a fractional part.
    if (peek() === "." && isDigit(peekNext())) {
      // Consume the "."
      advance();

      while (isDigit(peek())) advance();
    }

    addToken("NUMBER", parseFloat(source.substring(start, current)));
  }

  function processIdentifier(): void {
    while (isAlphaNumeric(peek())) advance();

    const text = source.substring(start, current);
    const type = KEYWORDS[text];
    addToken(type || "IDENTIFIER");
  }

  // Utilities

  function isAtEnd(): boolean {
    return current >= source.length;
  }

  function advance(): string {
    return source.charAt(current++);
  }

  function addToken(type: TokenType, literal: TokenValue = null): void {
    const text = source.slice(start, current);
    tokens.push(newToken(type, text, literal, line));
  }

  function match(expected: string): boolean {
    if (isAtEnd()) return false;
    if (source.charAt(current) !== expected) return false;
    current++;
    return true;
  }

  function peek(): string {
    if (isAtEnd()) return "\0";
    return source.charAt(current);
  }

  function peekNext(): string {
    if (current + 1 >= source.length) return "\0";
    return source.charAt(current + 1);
  }
}

function isDigit(char: string): boolean {
  return "0123456789".includes(char);
}
function isAlpha(char: string) {
  return /[a-zA-Z_]/.test(char);
}
function isAlphaNumeric(char: string): boolean {
  return isAlpha(char) || isDigit(char);
}
