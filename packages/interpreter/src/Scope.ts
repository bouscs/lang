export class Scope {
  parent?: Scope

  registry: Record<string, any> = {}

  constructor(parent?: Scope) {
    this.parent = parent
  }

  createDataType(name: string) {
    if (Object.hasOwn(this.registry, name)) {
      throw new Error(`Data type "${name}" already exists`)
    }

    Object.defineProperty(this.registry, name, {})
  }
}
