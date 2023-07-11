import { Expression } from '../Expression.js'
import { Scope } from '../Scope.js'
import { Value } from '../Value.js'

export class TokenExpression extends Expression {
  value: string

  constructor(value: string) {
    super('token')
    this.value = value
  }

  raw() {
    return this.value
  }

  async execute(context: Scope): Promise<Value> {
    throw new Error('Cannot execute raw token.')
  }
}
