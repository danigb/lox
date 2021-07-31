let _hadError = false;

export function error(line: number, message: string) {
  report(line, "", message);
}

export function hadError(): boolean {
  return _hadError;
}

function report(line: number, where: string, message: string) {
  _hadError = true;
  console.log(`[line: ${line}] Error ${where}: ${message}`);
}
