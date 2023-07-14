import { BooleanValue } from '../../values/BooleanValue.js'
import { binaryOperation } from '../BinaryOperation.js'

export const EqualExpression = binaryOperation({
  operator: '=',
  returnType: 'value',
  parsedType: 'boolean',
  result: (left, right) => new BooleanValue(Number(left.raw()) == Number(right.raw()))
})
