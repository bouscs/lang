import { Value } from '../Value.js'

export interface TypeValueProperties {}

export class TypeValue extends Value {
  typeName: string

  properties: TypeValueProperties = {} as any

  constructor(typeName: string, properties?: TypeValueProperties) {
    super('type')

    this.typeName = typeName

    if (properties) {
      this.properties = properties
    }
  }

  raw() {
    return this.typeName
  }

  type() {
    return 'type'
  }

  clone() {
    return new TypeValue(this.typeName)
  }
}
