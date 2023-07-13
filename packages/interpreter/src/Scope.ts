import { ScopeProperty, ScopePropertyOptions } from './ScopeProperty.js'
import { Value } from './Value.js'

export class Scope {
  registry: Record<string, ScopeProperty> = {}
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

  create(name: string, options: ScopePropertyOptions) {
    if (Object.hasOwn(this.registry, name)) {
      throw new Error(`Symbol "${name}" already exists`)
    }

    Object.defineProperty(this.registry, name, {
      value: new ScopeProperty(options)
    })
  }

  get(name: string) {
    if (this.registry[name] === undefined) {
      throw new Error(`Symbol "${name}" does not exist`, { cause: { name } })
    }

    return this.registry[name]
  }

  assign(name: string, value: Value) {
    if (value.type() !== this.registry[name].type) {
      throw new Error(`Cannot assign value of type "${value.type()}" to property of type "${this.registry[name].type}"`)
    }

    if (!this.registry[name].mutable) {
      throw new Error(`Cannot assign value to immutable property "${name}"`)
    }

    this.registry[name].value = value
  }
}
