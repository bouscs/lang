export abstract class Value {
  abstract raw(): string
  abstract type(): string
  abstract clone(): Value
}
