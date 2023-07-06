import { Scope } from './Scope.js'

export class ExecutionContext {
  scope: Scope

  constructor() {
    this.scope = new Scope()

    this.scope.createDataType('symbol')
    this.scope.createDataType('expression')
    this.scope.createDataType('statement')
  }
}
