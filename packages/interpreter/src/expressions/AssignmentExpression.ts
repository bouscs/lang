import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { NoneValue } from '../values/NoneValue.js'
import { SymbolValue } from '../values/SymbolValue.js'
import { TokenExpression } from './TokenExpression.js'

export class AssignmentExpression extends Expression {
  static match(code: Expression[]): boolean {
    return code.some(ex => ex instanceof TokenExpression && ex.value === '<-')
  }

  static async validate(code: Expression[]): Promise<boolean> {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code, parse } = options

    const assignmentIndex = code.findIndex(t => t instanceof TokenExpression && t.value === '<-')

    const left = code[assignmentIndex - 1] as Expression<string, SymbolValue>

    const rightIndex = code.slice(assignmentIndex + 1).findIndex(t => t.returnType() !== 'none')

    const right = code[assignmentIndex + rightIndex + 1]

    code.splice(assignmentIndex - 1, rightIndex + 3, new AssignmentExpression(left, right))
  }

  left: Expression<string, SymbolValue>

  right: Expression

  constructor(left: Expression<string, SymbolValue>, right: Expression) {
    super('assignment')

    this.left = left
    this.right = right
  }

  async execute(context: Scope) {
    const left = await this.left.execute(context)
    const right = await this.right.execute(context)

    if (right instanceof SymbolValue) {
      context.create(left.value, {
        type: context.get(right.value).type,
        value: context.get(right.value).value?.clone()
      })
    } else {
      context.create(left.value, {
        type: right.type(),
        value: right
      })
    }

    return new NoneValue()
  }

  raw() {
    return `${this.left.raw()} <- ${this.right.raw()}`
  }
}
