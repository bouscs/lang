import { Value } from '../Value.js'

export class SymbolValue extends Value {
  value: string

  constructor(value: string) {
    super()
    this.value = value
  }

  raw() {
    return this.value
  }

  type() {
    return 'symbol'
  }

  clone() {
    return new SymbolValue(this.value)
  }
}
