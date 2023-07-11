export class Scope {
  registry: Record<string, any> = {}
  _parent?: Scope

  get parent() {
    return this._parent
  }

  set parent(value) {
    this._parent = value

    if (value) {
      Object.setPrototypeOf(this.registry, value.registry)
    }
  }

  constructor(parent?: Scope) {
    this.registry = {}
    this.parent = parent
  }

  exists(name: string) {
    return this.registry[name] !== undefined
  }

  get(name: string) {
    if (this.registry[name] === undefined) {
      throw new Error(`Symbol "${name}" does not exist`)
    }

    return this.registry[name]
  }

  set(name: string, value: any) {
    Object.defineProperty(this.registry, name, {
      value
    })
  }
}
