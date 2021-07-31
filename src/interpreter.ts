import { Expr, ExprVisitor, visit } from "./exprs.ts";
import { Token, TokenValue } from "./tokens.ts";
import { LexError, reportError } from "./errors.ts";

class EvalError extends LexError {}

/**
 * https://craftinginterpreters.com/evaluating-expressions.html
 */
export function interpret(expr: Expr) {
  try {
    return evaluate(expr);
  } catch (err) {
    reportError(err);
  }
}

function evaluate(expr: Expr): TokenValue {
  return visit(expr, visitor);
}

const visitor: ExprVisitor<TokenValue> = {
  visitLiteral(expr) {
    return expr.value;
  },
  visitUnary(expr) {
    const value = evaluate(expr.right);
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

  visitGrouping(expr) {
    return evaluate(expr.expr);
  },
  visitBinary({ left, operator, right }) {
    const leftVal = evaluate(left);
    const rightVal = evaluate(right);

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
