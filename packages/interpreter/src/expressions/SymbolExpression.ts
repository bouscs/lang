import { ParseOptions } from 'querystring'
import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { isWordToken } from '../util.js'
import { TokenExpression } from './TokenExpression.js'
import { Value } from '../Value.js'
import { SymbolValue } from '../values/SymbolValue.js'
import { BooleanValue } from '../values/BooleanValue.js'

export class SymbolExpression extends Expression<string, Value> {
  symbol: string

  static match(code: Expression[]) {
    return code.some(ex => ex instanceof TokenExpression && isWordToken(ex.raw()))
  }

  static async validate(code: Expression[]) {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code } = options

    const symbolIndexes = code
      .map((ex, i) => ({ raw: ex.raw(), i, token: ex instanceof TokenExpression }))
      .filter(({ raw, token }) => token && isWordToken(raw))

    for (const { raw, i } of symbolIndexes) {
      const symbol = raw

      code[i] = new SymbolExpression(symbol)
    }
  }

  constructor(symbol: string) {
    super('symbol')

    this.symbol = symbol
  }

  raw() {
    return this.symbol
  }

  returnType(): string {
    return 'value'
  }

  async execute(context: Scope) {
    if (context.exists(this.symbol)) {
      const property = context.get(this.symbol)

      if (property.value) {
        return property.value
      }
    }

    return new SymbolValue(this.symbol)
  }
}
