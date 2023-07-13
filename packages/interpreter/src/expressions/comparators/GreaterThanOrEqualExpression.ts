import { BooleanValue } from '../../values/BooleanValue.js'
import { binaryOperation } from '../BinaryOperation.js'

export const GreaterThanOrEqualExpression = binaryOperation({
  operator: '>=',
  returnType: 'boolean',
  parsedType: 'boolean',
  result: (left, right) => new BooleanValue(Number(left.raw()) >= Number(right.raw()))
})
