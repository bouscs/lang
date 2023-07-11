import { Interpreter } from './Interpreter.js'
import { Scope } from './Scope.js'
import { Value } from './Value.js'

export interface ParserOptions {
  code: Expression[]
  parse: typeof Interpreter.prototype.parse
}

export interface ExpressionConstructor<T extends Expression = Expression> {
  match(input: Expression[]): boolean
  validate(input: Expression[]): Promise<boolean>
  parse(options: ParserOptions): Promise<void>
  new (...args: any[]): T
}

export abstract class Expression<T extends string = string, ReturnValue extends Value = Value> {
  parsedType: T

  constructor(parsedType: T) {
    this.parsedType = parsedType
  }

  abstract execute(context: Scope): Promise<ReturnValue>

  abstract raw(): string

  returnType() {
    return 'none'
  }
}
