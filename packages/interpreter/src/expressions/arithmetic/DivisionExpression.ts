import { Expression, ParserOptions } from '../../Expression.js'
import { Scope } from '../../Scope.js'
import { Value } from '../../Value.js'
import { NumberValue } from '../../values/NumberValue.js'
import { TypeValue } from '../../values/TypeValue.js'
import { TokenExpression } from '../TokenExpression.js'

export class DivisionExpression extends Expression {
  static match(code: Expression[]) {
    return code.some(e => e instanceof TokenExpression && e.value === '/')
  }

  static async validate(code: Expression[]) {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code } = options

    // console.log('code', JSON.stringify({ raw: code.map(c => c.raw()).join(''), code }, null, 2))

    const plusIndex = code.findIndex(e => e instanceof TokenExpression && e.value === '/')

    if (plusIndex === -1) throw new Error('Plus not found')

    const left = code[plusIndex - 1]

    const rightIndex = code.slice(plusIndex + 1).findIndex(t => !(t instanceof TokenExpression && t.value === '\n'))

    // const right = code[plusIndex + 1]
    const right = code[plusIndex + rightIndex + 1]

    // code.splice(plusIndex - 1, 3, new PlusOperationExpression(left, right))
    code.splice(plusIndex - 1, rightIndex + 3, new DivisionExpression(left, right))
  }

  leftOperand: Expression
  rightOperand: Expression

  constructor(leftOperand: Expression, rightOperand: Expression) {
    super('plusOperation')

    this.leftOperand = leftOperand
    this.rightOperand = rightOperand
  }

  raw() {
    return `${this.leftOperand.raw()} / ${this.rightOperand.raw()}`
  }

  returnType(context?: Scope) {
    // if (!context) throw new Error('Context is required')

    // const leftType = this.leftOperand.returnType()
    // const leftTypeProp = context.get(leftType)

    // const rightType = this.rightOperand.returnType()
    // const rightTypeProp = context.get(rightType)

    // if (leftTypeProp.type !== 'type' || rightTypeProp.type !== 'type')
    //   throw new Error('Left and right operands types not found in scope')

    // const leftTypeValue = leftTypeProp.value as TypeValue
    // const rightTypeValue = rightTypeProp.value as TypeValue

    // TODO check if left and right types are compatible

    return 'number'
  }

  async execute(context: Scope) {
    const leftValue = (await this.leftOperand.execute(context)) as NumberValue
    const rightValue = (await this.rightOperand.execute(context)) as NumberValue

    // TODO execute operation from TypeValue

    return new NumberValue(leftValue.value / rightValue.value)
  }
}
