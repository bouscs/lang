import { Value } from '../Value.js'

export class CallableValue extends Value {
  callable: CallableFunction
  constructor(callable: CallableFunction) {
    super('callable')
    this.callable = callable
  }

  call(...args: Value[]) {
    return this.callable(...args)
  }

  raw() {
    return this.callable.toString()
  }

  type() {
    return 'callable'
  }

  clone() {
    return new CallableValue(this.callable)
  }
}
