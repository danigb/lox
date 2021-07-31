import { Token } from "./tokens.ts";

export class Environment {
  private readonly values = new Map<string, any>();

  define(name: string, value: any): void {
    console.log(">>> SET", { name, value });
    this.values.set(name, value);
  }

  get(name: Token): any {
    console.log(">>> GET", { name, value: this.values.get(name.lexeme) });
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }
  }
}
