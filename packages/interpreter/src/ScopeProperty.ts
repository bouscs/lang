import { Value } from './Value.js'

export interface ScopePropertyOptions<T extends Value | undefined> {
  value: T
  mutable?: boolean
  type?: string
}

export class ScopeProperty<T extends Value | undefined = Value | undefined> {
  private _value: T
  mutable: boolean
  type: string

  get value() {
    return this._value
  }

  set value(value: T) {
    if (!this.mutable) {
      throw new Error('Cannot set value of immutable property')
    }

    this._value = value
  }

  constructor(options: ScopePropertyOptions<T>) {
    this.mutable = true
    this.value = options.value
    this.mutable = options.mutable || false
    this.type = options.type || 'any'
  }
}
