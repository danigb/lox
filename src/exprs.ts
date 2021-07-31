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
  visitLiteral(expr: Literal): T;
  visitUnary(expr: Unary): T;
  visitGrouping(expr: Grouping): T;
  visitBinary(expr: Binary): T;
};

export function visit<T>(expr: Expr, visitor: ExprVisitor<T>): T {
  switch (expr.type) {
    case "Literal":
      return visitor.visitLiteral(expr);
    case "Unary":
      return visitor.visitUnary(expr);
    case "Grouping":
      return visitor.visitGrouping(expr);
    case "Binary":
      return visitor.visitBinary(expr);
    default:
      throw new Error("Unknown expression type");
  }
}
