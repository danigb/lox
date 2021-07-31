let _hadError = false;

export class LexError extends Error {
  public readonly line: number;
  public readonly where: string;
  public readonly cause: string;

  constructor(line: number, where: string, cause: string) {
    super(`[line: ${line}] Error ${where}: ${cause}`);
    this.line = line;
    this.where = where;
    this.cause = cause;
  }
}

export function hadError(): boolean {
  return _hadError;
}

export function reportError(error: LexError) {
  console.log(error);
  _hadError = true;
}
