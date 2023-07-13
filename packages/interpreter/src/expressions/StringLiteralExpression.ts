import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { StringValue } from '../values/StringValue.js'
import { TokenExpression } from './TokenExpression.js'

export class StringLiteralExpression extends Expression {
  static match(code: Expression[]) {
    return code.some(e => e instanceof TokenExpression && e.value.startsWith('"'))
  }

  static async validate(code: Expression[]) {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code } = options

    const tokenIndex = code.findIndex(e => e instanceof TokenExpression && e.value.startsWith('"'))

    const token = code[tokenIndex] as TokenExpression

    code.splice(tokenIndex, 1, new StringLiteralExpression(token.value.split('"')[1]))
  }

  value: string

  constructor(value: string) {
    super('string')

    this.value = value
  }

  raw() {
    return `"${this.value}"`
  }

  returnType() {
    return 'string'
  }

  async execute(context: Scope) {
    return new StringValue(this.value)
  }
}
