export type TokenType =
  // Single-character tokens.
  | "LEFT_PAREN"
  | "RIGHT_PAREN"
  | "LEFT_BRACE"
  | "RIGHT_BRACE"
  | "COMMA"
  | "DOT"
  | "MINUS"
  | "PLUS"
  | "SEMICOLON"
  | "SLASH"
  | "STAR"

  // One or two character tokens
  | "BANG"
  | "BANG_EQUAL"
  | "EQUAL"
  | "EQUAL_EQUAL"
  | "GREATER"
  | "GREATER_EQUAL"
  | "LESS"
  | "LESS_EQUAL"

  // Literals
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"

  // Keywords
  | "AND"
  | "CLASS"
  | "ELSE"
  | "FALSE"
  | "FUN"
  | "FOR"
  | "IF"
  | "NIL"
  | "OR"
  | "PRINT"
  | "RETURN"
  | "SUPER"
  | "THIS"
  | "TRUE"
  | "VAR"
  | "WHILE"

  // Utility
  | "EOF";

export type TokenValue = boolean | number | string | null;

export type Token = {
  readonly type: TokenType;
  readonly lexme: string;
  readonly literal: TokenValue;
  readonly line: number;
};

export function newToken(
  type: TokenType,
  lexme: string,
  literal: TokenValue,
  line: number
): Token {
  return {
    type,
    lexme,
    literal,
    line,
  };
}
