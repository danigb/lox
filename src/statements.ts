import { Expr } from "./expressions.ts";
import { TokenValue } from "./tokens.ts";

type ExprStmt = { type: "Expression"; expr: Expr };
type PrintStmt = { type: "Print"; expr: Expr };
type VarStmt = { type: "Var"; name: TokenValue; value: Expr | null };
type BlockStmt = { type: "Block"; statements: Stmt[] };

export type Stmt = ExprStmt | PrintStmt | VarStmt | BlockStmt;

export type StmtVisitor<T, C> = {
  visitExpression(stmt: ExprStmt, ctx: C): T;
  visitPrint(stmt: PrintStmt, ctx: C): T;
  visitVar(stmt: VarStmt, ctx: C): T;
  visitBlock(stmt: BlockStmt, ctx: C): T;
};

export function visitStmt<T, C>(
  stmt: Stmt,
  ctx: C,
  visitor: StmtVisitor<T, C>
): T {
  switch (stmt.type) {
    case "Expression":
      return visitor.visitExpression(stmt, ctx);
    case "Print":
      return visitor.visitPrint(stmt, ctx);
    case "Var":
      return visitor.visitVar(stmt, ctx);
    case "Block":
      return visitor.visitBlock(stmt, ctx);
  }
}
