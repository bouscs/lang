import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { NumberValue } from '../values/NumberValue.js'
import { TokenExpression } from './TokenExpression.js'

export class NumberLiteralExpression extends Expression {
  static match(code: Expression[]): boolean {
    return code.some(ex => ex instanceof TokenExpression && /^\d+(?:\.\d+)?$/.test(ex.raw()))
  }

  static async validate(code: Expression[]): Promise<boolean> {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code } = options

    const numberIndexes = code.map((ex, i) => ({ raw: ex.raw(), i })).filter(({ raw }) => /^\d+(?:\.\d+)?$/.test(raw))

    for (const { raw, i } of numberIndexes) {
      const number = Number(raw)

      code[i] = new NumberLiteralExpression(number)
    }
  }

  value: number

  constructor(value: number) {
    super('number')

    this.value = value
  }

  raw() {
    return this.value.toString()
  }

  returnType(): string {
    return 'number'
  }

  async execute(context: Scope) {
    return new NumberValue(this.value)
  }
}
