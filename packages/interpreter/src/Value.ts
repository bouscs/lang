export abstract class Value {
  valueType: string

  abstract raw(): string
  abstract type(): string
  abstract clone(): Value

  constructor(valueType: string) {
    this.valueType = valueType
  }
}
