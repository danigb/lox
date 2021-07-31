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

export type Variable = { type: "Variable"; name: Token };

export type Expr = Literal | Unary | Grouping | Binary | Variable;

export type ExprVisitor<T, C> = {
  visitLiteral(expr: Literal, context: C): T;
  visitUnary(expr: Unary, context: C): T;
  visitGrouping(expr: Grouping, context: C): T;
  visitBinary(expr: Binary, context: C): T;
  visitVariable(expr: Variable, context: C): T;
};

export function visitExpr<T, C>(
  expr: Expr,
  ctx: C,
  visitor: ExprVisitor<T, C>
): T {
  switch (expr.type) {
    case "Literal":
      return visitor.visitLiteral(expr, ctx);
    case "Unary":
      return visitor.visitUnary(expr, ctx);
    case "Grouping":
      return visitor.visitGrouping(expr, ctx);
    case "Binary":
      return visitor.visitBinary(expr, ctx);
    case "Variable":
      return visitor.visitVariable(expr, ctx);
    default:
      throw new Error("Unknown expression type");
  }
}
