import { Interpreter, LineParser, ParseLineOptions, ParsedLine, Token } from './Interpreter.js'
import { Scope } from './Scope.js'

export abstract class ExpressionParser {
  abstract match(tokens: ParsedLine[]): boolean
  abstract parse(options: { code: ParsedLine[]; scope: Scope; parse: typeof Interpreter.prototype.parse })
  abstract parseLine(options: ParseLineOptions): ReturnType<LineParser>
}
