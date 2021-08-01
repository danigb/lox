import { Expr, ExprVisitor, visitExpr } from "./expressions.ts";
import { Token, TokenValue } from "./tokens.ts";
import { LexError, reportError } from "./errors.ts";
import { Stmt, StmtVisitor, visitStmt } from "./statements.ts";
import { Environment } from "./environment.ts";

class EvalError extends LexError {}

/**
 * https://craftinginterpreters.com/evaluating-expressions.html
 */
export class Interpreter {
  private readonly environment = new Environment();

  run(statements: Stmt[]) {
    try {
      for (const stmt of statements) {
        execute(stmt, this.environment);
      }
    } catch (err) {
      reportError(err);
    }
  }
}

function execute(stmt: Stmt, env: Environment) {
  visitStmt(stmt, env, stmtVisitor);
}

const stmtVisitor: StmtVisitor<void, Environment> = {
  visitExpression(stmt, env) {
    evaluate(stmt.expr, env);
  },
  visitPrint(stmt, env) {
    const value = evaluate(stmt.expr, env);
    console.log(value);
  },
  visitVar(stmt, env) {
    const value = stmt.value ? evaluate(stmt.value, env) : null;
    const name = typeof stmt.name === "string" ? stmt.name : "";
    // FIXME: throw error if no name
    env.define(name, value);
  },
  visitBlock({ statements }, env) {
    const child = new Environment(env);
    for (const stmt of statements) {
      execute(stmt, child);
    }
  },
};

function evaluate(expr: Expr, env: Environment): TokenValue {
  return visitExpr(expr, env, exprVisitor);
}

const exprVisitor: ExprVisitor<TokenValue, Environment> = {
  visitLiteral(expr, env) {
    return expr.value;
  },
  visitUnary(expr, env) {
    const value = evaluate(expr.right, env);
    switch (expr.operator.type) {
      case "MINUS": {
        const num = assertNumberOperand(expr.operator, value);
        return -num;
      }

      case "BANG":
        return !isTruthy(value);

      default:
        throw new Error("FIXME");
    }
  },

  visitGrouping(expr, env) {
    return evaluate(expr.expr, env);
  },
  visitBinary({ left, operator, right }, env) {
    const leftVal = evaluate(left, env);
    const rightVal = evaluate(right, env);

    switch (operator.type) {
      case "PLUS": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);
        return lnum + rnum;
      }
      case "MINUS": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);
        return lnum - rnum;
      }
      case "SLASH": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);
        return lnum / rnum;
      }
      case "STAR": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);
        return lnum * rnum;
      }
      case "GREATER": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);
        return lnum > rnum;
      }

      case "GREATER_EQUAL": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);
        return lnum >= rnum;
      }
      case "LESS": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);
        return lnum < rnum;
      }
      case "LESS_EQUAL": {
        const [lnum, rnum] = numberOperands(operator, leftVal, rightVal);

        return lnum <= rnum;
      }
      case "EQUAL_EQUAL": {
        return leftVal === rightVal;
      }
      case "BANG_EQUAL":
        return leftVal !== rightVal;
      default:
        throw error(operator, "not implemented");
    }
  },
  visitVariable(expr, env) {
    return env.get(expr.name);
  },
  visitAssign(expr, env) {
    const value = evaluate(expr.value, env);
    env.assign(expr.name, value);
    return value;
  },
};

function assertNumberOperand(operator: Token, operand: TokenValue): number {
  if (!isNumber(operand)) {
    throw error(operator, "Not a number");
  }
  return operand;
}

function numberOperands(
  operator: Token,
  left: TokenValue,
  right: TokenValue
): [number, number] {
  if (!isNumber(left) || !isNumber(right)) {
    throw error(operator, "Not a number");
  }
  return [left, right];
}

function error(operator: Token, message: string): EvalError {
  return new EvalError(operator.line, "", message);
}

function isTruthy(value: TokenValue): boolean {
  if (typeof value === "boolean") return value;
  else if (value === null) return false;
  else return true;
}

function isNumber(value: TokenValue): value is number {
  return typeof value === "number";
}
