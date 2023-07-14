import { Value } from '../Value.js'

export class NoneValue extends Value {
  raw() {
    return 'none'
  }

  type() {
    return 'none'
  }

  clone() {
    return new NoneValue()
  }

  constructor() {
    super('none')
  }
}
