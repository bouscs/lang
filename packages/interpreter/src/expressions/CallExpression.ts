import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { Value } from '../Value.js'
import { CallableValue } from '../values/CallableValue.js'
import { SymbolValue } from '../values/SymbolValue.js'
import { ParenthesisExpression } from './ParenthesisExpression.js'

export class CallExpression extends Expression {
  static match(code: Expression[]): boolean {
    return code.some((ex, i) => ex.returnType() === 'value' && code[i + 1] instanceof ParenthesisExpression)
  }

  static async validate(code: Expression[]): Promise<boolean> {
    return true
  }

  static async parse(options: ParserOptions): Promise<void> {
    const { code } = options

    const callIndex = code.findIndex(
      (ex, i) => ex.returnType() === 'value' && code[i + 1] instanceof ParenthesisExpression
    )

    const symbol = code[callIndex] as Expression

    const callInner = code[callIndex + 1] as ParenthesisExpression

    code.splice(callIndex, 2, new CallExpression(symbol, callInner))
  }

  symbol: Expression
  callInner: ParenthesisExpression

  constructor(symbol: Expression, callInner: ParenthesisExpression) {
    super('call')

    this.symbol = symbol
    this.callInner = callInner
  }

  async execute(context: Scope) {
    const value = await this.symbol.execute(context)
    const callInner = await this.callInner.execute(context)

    // const value = context.get(symbol.value).value as CallableValue

    if (!(value instanceof CallableValue)) throw new Error(`Value ${value} is not callable`)

    return value.call(callInner)
  }

  raw() {
    return `${this.symbol.raw()}${this.callInner.raw()}`
  }

  returnType(): string {
    return 'value'
  }
}
