import { Value } from '../Value.js'

export class NumberValue extends Value {
  value: number

  constructor(value: number) {
    super('number')
    this.value = value
  }

  raw() {
    return this.value.toString()
  }

  type() {
    return 'number'
  }

  clone() {
    return new NumberValue(this.value)
  }

  toString() {
    return this.raw()
  }
}
