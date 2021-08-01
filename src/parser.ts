import { Token, TokenType } from "./tokens.ts";
import { Expr } from "./expressions.ts";
import { Stmt } from "./statements.ts";
import { LexError, reportError } from "./errors.ts";

export class ParseError extends LexError {}

/**
 * https://craftinginterpreters.com/parsing-expressions.html
 *
 * program        → declaration* EOF ;
 * declaration    → varDecl
 *                | statement ;
 * statement      → exprStmt
 *                | printStmt
 *                | block ;
 * block          → "{" declaration* "}"
 * varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;
 * expression     → assignment ;
 * assignment     → IDENTIFIER  "=" assignment;
 *                | equality ;
 * equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 * term           → factor ( ( "-" | "+" ) factor )* ;
 * factor         → unary ( ( "/" | "*" ) unary )* ;
 * unary          → ( "!" | "-" ) unary
 *                | primary ;
 * primary        → NUMBER | STRING | "true" | "false" | "nil"
 *                | "(" expression ")"
 *                | IDENTIFIER ;
 */
export function parse(tokens: Token[]): Stmt[] {
  // State
  let current = 0;

  // Parse
  return program();

  // Grammar
  function program(): Stmt[] {
    const statements: Stmt[] = [];
    while (!isAtEnd()) {
      statements.push(declaration());
    }
    return statements;
  }

  function declaration(): Stmt {
    try {
      if (match("VAR")) {
        return varDeclaration();
      }
      return statement();
    } catch (err) {
      synchronize();
      return statement();
    }
  }

  function varDeclaration(): Stmt {
    const name = consume("IDENTIFIER", "Expect variable name.").lexeme;
    const value = match("EQUAL") ? expression() : null;
    consume("SEMICOLON", "Expect ';' after variable declaration.");
    return { type: "Var", name, value };
  }

  function statement(): Stmt {
    if (match("PRINT")) {
      // Print statement
      const expr = expression();
      consume("SEMICOLON", "Expect ';' after value.");
      return { type: "Print", expr };
    } else if (match("LEFT_BRACE")) {
      // Block statement
      const statements: Stmt[] = [];
      while (!check("RIGHT_BRACE") && !isAtEnd()) {
        statements.push(declaration());
      }
      consume("RIGHT_BRACE", "Expect '}' after block.");
      return { type: "Block", statements };
    } else {
      // Expression statement
      const expr = expression();
      consume("SEMICOLON", "Expect ';' after value.");
      return { type: "Expression", expr };
    }
  }

  function expression(): Expr {
    return assignment();
  }

  function assignment(): Expr {
    let expr: Expr = equality();
    if (match("EQUAL")) {
      const equals = previous();
      const value = assignment();

      if (expr.type === "Variable") {
        const name = expr.name;
        return { type: "Assign", name, value };
      }

      error(equals, "Invalid assignment target.");
    }
    return expr;
  }

  function equality(): Expr {
    let expr: Expr = comparison();

    while (match("BANG_EQUAL", "EQUAL_EQUAL")) {
      const operator = previous();
      const right = comparison();
      expr = { type: "Binary", left: expr, operator, right };
    }

    return expr;
  }

  function comparison(): Expr {
    let expr: Expr = term();

    while (match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = previous();
      const right = term();
      expr = { type: "Binary", left: expr, operator, right };
    }

    return expr;
  }

  function term(): Expr {
    let expr: Expr = factor();
    while (match("MINUS", "PLUS")) {
      const operator = previous();
      const right = factor();
      expr = { type: "Binary", left: expr, operator, right };
    }
    return expr;
  }

  function factor(): Expr {
    let expr: Expr = unary();

    while (match("SLASH", "STAR")) {
      const operator = previous();
      const right = unary();
      expr = { type: "Binary", left: expr, operator, right };
    }
    return expr;
  }

  function unary(): Expr {
    if (match("BANG", "MINUS")) {
      const operator = previous();
      const right = unary();
      return { type: "Unary", operator, right };
    }

    return primary();
  }
  function primary(): Expr {
    if (match("FALSE")) return { type: "Literal", value: false };
    if (match("TRUE")) return { type: "Literal", value: true };
    if (match("NIL")) return { type: "Literal", value: null };

    if (match("NUMBER", "STRING")) {
      return { type: "Literal", value: previous().literal };
    }

    if (match("IDENTIFIER")) {
      return { type: "Variable", name: previous() };
    }

    if (match("LEFT_PAREN")) {
      const expr = expression();
      consume("RIGHT_PAREN", "Expect ')' after expression.");
      return { type: "Grouping", expr };
    }
    throw error(peek(), "Invalid primary expression");
  }

  // Error handling

  // https://craftinginterpreters.com/parsing-expressions.html#synchronizing-a-recursive-descent-parser
  function synchronize() {
    advance();

    while (!isAtEnd()) {
      if (previous().type === "SEMICOLON") return;

      switch (peek().type) {
        case "CLASS":
        case "FUN":
        case "VAR":
        case "FOR":
        case "IF":
        case "WHILE":
        case "PRINT":
        case "RETURN":
          return;
      }
      advance();
    }
  }

  // Utilities

  function match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }

    return false;
  }

  function check(type: TokenType): boolean {
    if (isAtEnd()) return false;
    return peek().type == type;
  }

  function advance(): Token {
    if (!isAtEnd()) current++;
    return previous();
  }

  function isAtEnd(): boolean {
    return peek().type === "EOF";
  }

  function peek(): Token {
    return tokens[current];
  }

  function previous(): Token {
    return tokens[current - 1];
  }

  function consume(type: TokenType, message: string): Token {
    if (check(type)) return advance();

    throw error(peek(), message);
  }

  function error(token: Token, cause: string) {
    const error =
      token.type === "EOF"
        ? new ParseError(token.line, " at end", cause)
        : new ParseError(token.line, ` at '${token.lexeme}'`, cause);

    reportError(error);
    return error;
  }
}
