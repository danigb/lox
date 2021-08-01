import { Token, TokenValue } from "./tokens.ts";

type Literal = { type: "Literal"; value: TokenValue };

type Unary = { type: "Unary"; operator: Token; right: Expr };

type Grouping = { type: "Grouping"; expr: Expr };

type Binary = {
  type: "Binary";
  left: Expr;
  operator: Token;
  right: Expr;
};

type Variable = { type: "Variable"; name: Token };

type Assign = { type: "Assign"; name: Token; value: Expr };

export type Expr = Literal | Unary | Grouping | Binary | Variable | Assign;

export type ExprVisitor<T, C> = {
  visitLiteral(expr: Literal, context: C): T;
  visitUnary(expr: Unary, context: C): T;
  visitGrouping(expr: Grouping, context: C): T;
  visitBinary(expr: Binary, context: C): T;
  visitVariable(expr: Variable, context: C): T;
  visitAssign(expr: Assign, context: C): T;
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
    case "Assign":
      return visitor.visitAssign(expr, ctx);
    default:
      throw new Error("Unknown expression type");
  }
}
