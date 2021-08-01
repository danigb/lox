import { log } from "./logger.ts";
import { Token } from "./tokens.ts";

export class Environment {
  private readonly values = new Map<string, any>();

  define(name: string, value: any): void {
    log(">>> SET", { name, value });
    this.values.set(name, value);
  }

  get(name: Token): any {
    log(">>> GET", { name, value: this.values.get(name.lexeme) });
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }
  }

  assign(name: Token, value: any): void {
    if (!this.values.has(name.lexeme)) {
      throw new Error(`Cannot assign to undefined variable ${name.lexeme}`);
    }

    log(">>> ASSIGN", { name, value });
    this.values.set(name.lexeme, value);
  }
}
