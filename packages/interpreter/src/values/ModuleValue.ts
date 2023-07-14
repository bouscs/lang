import { Scope } from '../Scope.js'
import { Value } from '../Value.js'

export class ModuleValue extends Value {
  scope: Scope

  constructor(scope: Scope) {
    super('module')

    this.scope = scope
  }

  raw() {
    return this.scope.toString()
  }

  type() {
    return 'module'
  }

  clone() {
    return new ModuleValue(this.scope)
  }
}
