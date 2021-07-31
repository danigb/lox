import { Token, TokenValue } from "./tokens.ts";

export type Literal = { type: "Literal"; value: TokenValue };

export type Unary = { type: "Unary"; operator: Token; right: Expr };

export type Grouping = { type: "Grouping"; expr: Expr };

export type Binary = {
  type: "Binary";
  left: Expr;
  operator: Token;
  right: Expr;
};

export type Expr = Literal | Unary | Grouping | Binary;

export type ExprVisitor<T> = {
  visitLiteral(node: Literal): T;
  visitUnary(node: Unary): T;
  visitGrouping(node: Grouping): T;
  visitBinary(node: Binary): T;
};
