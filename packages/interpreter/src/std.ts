import { TokenProcessorValue } from './CodeString.js'
import { Scope } from './Scope.js'
import { Value } from './Value.js'
import { binaryOperationsTypeSymbol } from './expressions/BinaryOperation.js'
import { BooleanValue } from './values/BooleanValue.js'
import { CallableValue } from './values/CallableValue.js'
import { NumberValue } from './values/NumberValue.js'
import { TypeValue } from './values/TypeValue.js'

export const applyStandardLibrary = (scope: Scope) => {
  scope.create<TokenProcessorValue>('clean', {
    type: 'tokenProcessor',
    value: new TokenProcessorValue(state => {
      if (state.buffer === ' ') {
        state.end()
      }
    })
  })

  scope.create('print', {
    type: 'callable',
    value: new CallableValue((...args: Value[]) => console.log(...args.map(p => p.toString())))
  })

  scope.create('number', {
    type: 'type',
    value: new TypeValue('number', {
      [binaryOperationsTypeSymbol]: {
        '>': {
          number: (left: NumberValue, right: NumberValue) => new BooleanValue(left.value > right.value)
        },
        '>=': {
          number: (left: NumberValue, right: NumberValue) => new BooleanValue(left.value >= right.value)
        },
        '<': {
          number: (left: NumberValue, right: NumberValue) => new BooleanValue(left.value < right.value)
        },
        '<=': {
          number: (left: NumberValue, right: NumberValue) => new BooleanValue(left.value <= right.value)
        },
        '=': {
          number: (left: NumberValue, right: NumberValue) => new BooleanValue(left.value === right.value)
        },
        '!=': {
          number: (left: NumberValue, right: NumberValue) => new BooleanValue(left.value !== right.value)
        },
        '+': {
          number: (left: NumberValue, right: NumberValue) => new NumberValue(left.value + right.value)
        },
        '-': {
          number: (left: NumberValue, right: NumberValue) => new NumberValue(left.value - right.value)
        },
        '*': {
          number: (left: NumberValue, right: NumberValue) => new NumberValue(left.value * right.value)
        },
        '/': {
          number: (left: NumberValue, right: NumberValue) => new NumberValue(left.value / right.value)
        }
      }
    })
  })
}
