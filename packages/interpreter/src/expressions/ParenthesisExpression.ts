import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { Value } from '../Value.js'
import { getBlockInner as getBlockInner } from '../util.js'
import { SymbolValue } from '../values/SymbolValue.js'
import { TokenExpression } from './TokenExpression.js'

export class ParenthesisExpression extends Expression {
  static match(code: Expression[]): boolean {
    return code.some(ex => ex instanceof TokenExpression && ex.value === '(')
  }

  static async validate(code: Expression[]): Promise<boolean> {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code, parse } = options

    const parenthesisIndex = code.findIndex(t => t instanceof TokenExpression && t.value === '(')

    const innerLines = getBlockInner(code.slice(parenthesisIndex + 1), '(', ')')

    // const result = await parse(innerLines)

    code.splice(parenthesisIndex, innerLines.length + 2, new ParenthesisExpression(await parse(innerLines)))
  }

  inner: Expression[]

  constructor(inner: Expression[]) {
    super('parenthesis')
    this.inner = inner
  }

  returnType(context?: Scope | undefined): string {
    return this.inner[this.inner.length - 1].returnType(context)
  }

  raw() {
    return `(${this.inner.map(ex => ex.raw()).join(' ')})`
  }

  async execute(context: Scope) {
    const scope = new Scope(context)

    const values = [] as Value[]

    for (const ex of this.inner) {
      values.push(await ex.execute(scope))
    }

    // console.log(
    //   'parenthesis values',
    //   JSON.stringify(
    //     values.map(v => v?.raw()),
    //     null,
    //     2
    //   )
    // )

    for (let i = 0; i < values.length; i++) {
      if (values[i] instanceof SymbolValue) {
        const value = scope.get(values[i].raw()).value

        if (!value) {
          throw new Error(`Symbol ${values[i].raw()} is not defined`, {
            cause: { lines: [this.inner[i]], code: JSON.stringify(this.inner, null, 2) }
          })
        }

        values[i] = value
      }
    }

    return values[values.length - 1]
  }
}
