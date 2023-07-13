import { Value } from '../Value.js'

export class StringValue extends Value {
  value: string
  constructor(value: string) {
    super()
    this.value = value
  }

  toString() {
    return this.value
  }

  clone() {
    return new StringValue(this.value)
  }

  raw(): string {
    return this.value
  }

  type() {
    return 'string'
  }
}
