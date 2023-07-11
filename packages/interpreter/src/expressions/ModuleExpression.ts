import { Expression } from '../Expression.js'
import { Scope } from '../Scope.js'
import { ModuleValue } from '../values/ModuleValue.js'
import { StatementExpression } from './StatementExpression.js'

export class ModuleExpression extends Expression {
  statements: Expression[]

  constructor(statements: Expression[]) {
    super('module')

    this.statements = statements
  }

  async execute(context: Scope) {
    const scope = new Scope(context)

    for (const statement of this.statements) {
      await statement.execute(scope)
    }

    return new ModuleValue(scope)
  }

  raw() {
    return this.statements.map(s => s.raw()).join('\n')
  }

  returnType() {
    return 'module'
  }
}
