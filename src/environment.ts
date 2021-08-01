import { log } from "./logger.ts";
import { Token } from "./tokens.ts";

export class Environment {
  private readonly values = new Map<string, any>();
  parent: Environment | undefined;

  constructor(parent?: Environment) {
    this.parent = parent;
  }

  define(name: string, value: any): void {
    log(">>> SET", { name, value });
    this.values.set(name, value);
  }

  get(name: Token): any {
    log(">>> GET", { name, value: this.values.get(name.lexeme) });
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    } else if (this.parent) {
      return this.parent.get(name);
    }

    throw new Error(`Cannot get undefined variable ${name.lexeme}`);
  }

  assign(name: Token, value: any): void {
    if (this.values.has(name.lexeme)) {
      log(">>> ASSIGN", { name, value });
      this.values.set(name.lexeme, value);
      return;
    } else if (this.parent) {
      this.parent.assign(name, value);
      return;
    }

    throw new Error(`Cannot assign to undefined variable ${name.lexeme}`);
  }
}
