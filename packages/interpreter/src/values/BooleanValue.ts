import { Value } from '../Value.js'

export class BooleanValue extends Value {
  value: boolean

  constructor(value: boolean) {
    super()
    this.value = value
  }

  raw() {
    return this.value.toString()
  }

  type() {
    return 'boolean'
  }

  clone() {
    return new BooleanValue(this.value)
  }

  toString() {
    return this.raw()
  }
}
