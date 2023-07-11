import { Value } from './Value.js'

export interface ScopePropertyOptions {
  value?: Value
  mutable?: boolean
  type?: string
}

export class ScopeProperty {
  value: Value | undefined
  mutable: boolean
  type: string

  constructor(options: ScopePropertyOptions) {
    this.value = options.value
    this.mutable = options.mutable || false
    this.type = options.type || 'any'
  }
}
