import { BooleanValue } from '../../values/BooleanValue.js'
import { binaryOperation } from '../BinaryOperation.js'

export const LessThanExpression = binaryOperation({
  operator: '<',
  returnType: 'value',
  parsedType: 'boolean'
})
