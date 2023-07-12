import { Value } from '../Value.js'
import { metaSymbol } from '../meta.js'

export class TypeValue extends Value {
  declare [metaSymbol]: {
    [key: string]: any
  }

  clone(): Value {
    return new TypeValue()
  }

  type(): string {
    return 'type'
  }

  raw(): string {
    return 'type'
  }

  toString(): string {
    return 'type'
  }
}
