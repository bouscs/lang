import { BooleanValue } from '../../values/BooleanValue.js'
import { binaryOperation } from '../BinaryOperation.js'

export const EqualExpression = binaryOperation({
  name: 'equal',
  operator: '=',
  returnType: 'value',
  parsedType: 'boolean'
})
