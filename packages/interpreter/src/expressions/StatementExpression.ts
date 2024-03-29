import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { Value } from '../Value.js'
import { BooleanValue } from '../values/BooleanValue.js'
import { SymbolValue } from '../values/SymbolValue.js'
import { TokenExpression } from './TokenExpression.js'

export class StatementExpression extends Expression {
  static match(code: Expression[]): boolean {
    return code.some(ex => ex instanceof TokenExpression && ex.value === '\n')
  }

  static async validate(code: Expression[]): Promise<boolean> {
    return true
  }

  static async parse(options: ParserOptions): Promise<void> {
    const { code } = options

    let firstNewLineIndex: number

    if (code[0] instanceof TokenExpression && code[0].value === '\n') {
      firstNewLineIndex = 0
    } else {
      if (!(code[1] instanceof TokenExpression && code[1].value === '\n')) {
        throw new Error('Invalid statement', {
          cause: { lines: [code[0], code[1]], code: JSON.stringify(code, null, 2) }
        })
      }
      firstNewLineIndex = 1
    }

    const statements = [] as Expression[]

    for (let i = firstNewLineIndex - 1; i < code.length; i += 2) {
      if (i < 0) continue
      const nextLine = code[i + 1]
      if (i + 1 < code.length && !(nextLine instanceof TokenExpression && nextLine.value === '\n')) {
        throw new Error('Invalid statement: expected newline', {
          cause: {
            lines: [JSON.stringify(code[i], null, 2), JSON.stringify(code[i + 1], null, 2)],
            code: JSON.stringify(code, null, 2)
          }
        })
      }
      statements.push(code[i])
    }

    code.splice(0, code.length, ...statements.map(s => new StatementExpression(s)))
  }

  expression: Expression

  constructor(expression: Expression) {
    super('statement')

    this.expression = expression
  }

  async execute(context: Scope) {
    const result = await this.expression.execute(context)

    if (result instanceof SymbolValue && !context.exists(result.raw())) {
      context.create(result.raw(), {
        value: new BooleanValue(true),
        type: 'boolean'
      })
    }

    return result
  }

  raw() {
    return '\n' + this.expression.raw()
  }

  returnType() {
    return this.expression.returnType()
  }
}
