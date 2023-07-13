import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { Value } from '../Value.js'
import { TokenExpression } from './TokenExpression.js'

import { Class } from 'aureamorum/src/util/types.js'

export interface BinaryOperationType {
  ParsedType: string
  ResultType: Value
}
namespace BinaryOperation {
  export type ParsedType<T extends BinaryOperationType> = T['ParsedType'] & string
  export type ResultType<T extends BinaryOperationType> = T['ResultType'] & Value
}

export interface BinaryOperationOptions<ResultType extends Value> {
  parsedType: string
  operator: string
  returnType: string
  result: (left: Value, right: Value) => ResultType
}

export const binaryOperation = <ResultType extends Value>(options: BinaryOperationOptions<ResultType>) => {
  const BinaryOperationClass = class extends Expression<string, ResultType> {
    static match(code: Expression[]) {
      return code.some(e => e instanceof TokenExpression && e.value === options.operator)
    }

    static async validate(code: Expression[]) {
      return true
    }

    declare static parse: (options: ParserOptions) => Promise<void>

    leftOperand: Expression
    rightOperand: Expression

    constructor(leftOperand: Expression, rightOperand: Expression) {
      super(options.parsedType)

      this.leftOperand = leftOperand
      this.rightOperand = rightOperand
    }

    raw() {
      return `${this.leftOperand.raw()} ${options.operator} ${this.rightOperand.raw()}`
    }

    returnType() {
      return options.returnType
    }

    async execute(context: Scope) {
      const leftValue = await this.leftOperand.execute(context)
      const rightValue = await this.rightOperand.execute(context)
      return options.result(leftValue, rightValue) as ResultType
    }
  }

  BinaryOperationClass.parse = async (_options: ParserOptions) => {
    const { code } = _options

    const plusIndex = code.findIndex(e => e instanceof TokenExpression && e.value === options.operator)

    if (plusIndex === -1) throw new Error(`Operator "${options.operator}" not found`)

    const left = code[plusIndex - 1]

    const rightIndex = code.slice(plusIndex + 1).findIndex(t => !(t instanceof TokenExpression && t.value === '\n'))

    const right = code[plusIndex + rightIndex + 1]

    code.splice(plusIndex - 1, rightIndex + 3, new BinaryOperationClass(left, right))
  }

  return BinaryOperationClass as {
    match(input: Expression[]): boolean
    validate(input: Expression[]): Promise<boolean>
    parse(options: ParserOptions): Promise<void>
    new (leftOperand: Expression, rightOperand: Expression): Expression<string, ResultType>
    prototype: Expression<string, ResultType>
  }
}
