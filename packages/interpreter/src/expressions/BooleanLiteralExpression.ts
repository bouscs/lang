import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { BooleanValue } from '../values/BooleanValue.js'
import { NumberValue } from '../values/NumberValue.js'
import { TokenExpression } from './TokenExpression.js'

export class BooleanLiteralExpression extends Expression {
  static match(code: Expression[]): boolean {
    return code.some(ex => ex instanceof TokenExpression && (ex.raw() === 'true' || ex.raw() === 'false'))
  }

  static async validate(code: Expression[]): Promise<boolean> {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code } = options

    const booleanIndexes = code
      .map((ex, i) => ({ raw: ex.raw(), i, token: ex instanceof TokenExpression }))
      .filter(ex => ex.token && (ex.raw === 'true' || ex.raw === 'false'))

    for (const { raw, i } of booleanIndexes) {
      const bool = raw === 'true'

      code[i] = new BooleanLiteralExpression(bool)
    }
  }

  value: boolean

  constructor(value: boolean) {
    super('number')

    this.value = value
  }

  raw() {
    return this.value.toString()
  }

  returnType(): string {
    return 'value'
  }

  async execute(context: Scope) {
    return new BooleanValue(this.value)
  }
}
