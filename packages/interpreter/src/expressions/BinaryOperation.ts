import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { TypeValue } from '../values/TypeValue.js'
import { Value } from '../Value.js'
import { TokenExpression } from './TokenExpression.js'

export const binaryOperationsTypeSymbol: unique symbol = Symbol()

declare module '../values/TypeValue.js' {
  interface TypeValueProperties {
    [binaryOperationsTypeSymbol]?: {
      [operator: string]:
        | {
            [typeName: string]: ((left: any, right: any) => Value) | undefined
          }
        | undefined
    }
  }
}

export interface BinaryOperationType {
  ParsedType: string
  ResultType: Value
}

export interface BinaryOperationOptions {
  name?: string
  parsedType: string
  operator: string
  returnType: string
  parse?: (options: ParserOptions) => Promise<void>
}

export const binaryOperation = <ResultType extends Value>(options: BinaryOperationOptions) => {
  const BinaryOperationClass = class extends Expression<string, ResultType> {
    static match(code: Expression[]) {
      return code.some(e => e instanceof TokenExpression && e.value === options.operator)
    }

    static async validate(code: Expression[]) {
      return true
    }

    static parse =
      options.parse ??
      (async (_options: ParserOptions) => {
        const { code } = _options

        const plusIndex = code.findIndex(e => e instanceof TokenExpression && e.value === options.operator)

        if (plusIndex === -1) throw new Error(`Operator "${options.operator}" not found in code.`)

        const left = code[plusIndex - 1]

        const rightIndex = code.slice(plusIndex + 1).findIndex(t => !(t instanceof TokenExpression && t.value === '\n'))

        const right = code[plusIndex + rightIndex + 1]

        code.splice(plusIndex - 1, rightIndex + 3, new BinaryOperationClass(left, right))
      })

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

      if (!context.exists(leftValue.type())) throw new Error(`Type "${leftValue.type()}" not found`)
      if (!context.exists(rightValue.type())) throw new Error(`Type "${rightValue.type()}" not found`)

      const leftType = context.get(leftValue.type())
      const rightType = context.get(rightValue.type())

      if (!leftType.value) throw new Error(`Malformed ScopeProperty "${leftValue.type()}"`)
      if (!(leftType.value instanceof TypeValue)) throw new Error(`Type "${leftValue.type()}" is not a type`)

      if (!rightType.value) throw new Error(`Malformed ScopeProperty "${rightValue.type()}"`)
      if (!(rightType.value instanceof TypeValue)) throw new Error(`Type "${rightValue.type()}" is not a type`)

      const leftTypeValue = leftType.value
      const rightTypeValue = rightType.value

      const operator =
        leftTypeValue.properties[binaryOperationsTypeSymbol]?.[options.operator]?.[rightTypeValue.typeName] ??
        rightTypeValue.properties[binaryOperationsTypeSymbol]?.[options.operator]?.[leftTypeValue.typeName]

      if (!operator)
        throw new Error(
          `Operator "${options.operator}" not found for types "${leftTypeValue.typeName}" and "${rightTypeValue.typeName}"`
        )

      return operator(leftValue, rightValue) as ResultType
    }
  }

  const className = options.name ?? `${options.parsedType} ${options.operator} ${options.parsedType}`

  Object.defineProperty(BinaryOperationClass, 'name', {
    value: className
  })

  return BinaryOperationClass as {
    match(input: Expression[]): boolean
    validate(input: Expression[]): Promise<boolean>
    parse(options: ParserOptions): Promise<void>
    new (leftOperand: Expression, rightOperand: Expression): Expression<string, ResultType>
    prototype: Expression<string, ResultType>
  }
}
