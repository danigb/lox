import { Expr } from "./expressions.ts";

export type ExprStmt = { type: "Expression"; expr: Expr };
export type PrintStmt = { type: "Print"; expr: Expr };

export type Stmt = ExprStmt | PrintStmt;

export type StmtVisitor<T> = {
  visitExpression(stmt: ExprStmt): T;
  visitPrint(stmt: PrintStmt): T;
};

export function visitStmt<T>(stmt: Stmt, visitor: StmtVisitor<T>): T {
  switch (stmt.type) {
    case "Expression":
      return visitor.visitExpression(stmt);
    case "Print":
      return visitor.visitPrint(stmt);
  }
}
