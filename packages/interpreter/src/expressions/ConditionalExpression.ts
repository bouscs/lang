import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { BooleanValue } from '../values/BooleanValue.js'
import { NoneValue } from '../values/NoneValue.js'
import { SymbolValue } from '../values/SymbolValue.js'
import { BlockExpression } from './BlockExpression.js'
import { ParenthesisExpression } from './ParenthesisExpression.js'
import { SymbolExpression } from './SymbolExpression.js'
import { TokenExpression } from './TokenExpression.js'

export class ConditionalExpression extends Expression {
  static match(code: Expression[]) {
    return code.some(e => e instanceof TokenExpression && e.value === 'if')
  }

  static async validate(code: Expression[]) {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code, parse } = options

    const ifIndex = code.findLastIndex(e => e instanceof TokenExpression && e.value === 'if')

    const condition = code[ifIndex + 1] as Expression<string, BooleanValue>

    let nextExpression = code[ifIndex + 2]

    do {
      if (nextExpression instanceof TokenExpression && nextExpression.value === '\n') {
        code.splice(ifIndex + 2, 1)
      }

      nextExpression = code[ifIndex + 2]
    } while (nextExpression instanceof TokenExpression && nextExpression.value === '\n')

    const trueBlock = code[ifIndex + 2] as Expression

    let newLines = 0

    nextExpression = code[ifIndex + 3]
    do {
      if (nextExpression instanceof TokenExpression && nextExpression.value === '\n') {
        newLines++
        nextExpression = code[ifIndex + 3 + newLines]
      }
    } while (nextExpression instanceof TokenExpression && nextExpression.value === '\n')

    const elseToken = code[ifIndex + 3 + newLines]

    if (elseToken instanceof TokenExpression && elseToken.value === 'else') {
      do {
        if (nextExpression instanceof TokenExpression && nextExpression.value === '\n') {
          code.splice(ifIndex + 4, 1)
        }

        nextExpression = code[ifIndex + 4]
      } while (nextExpression instanceof TokenExpression && nextExpression.value === '\n')
      const elseBlock = code[ifIndex + 4 + newLines] as Expression

      code.splice(ifIndex, 5 + newLines, new ConditionalExpression(condition, trueBlock, elseBlock))
    } else {
      code.splice(ifIndex, 3, new ConditionalExpression(condition, trueBlock))
    }
  }

  condition: Expression<string, BooleanValue>
  trueBlock: Expression
  falseBlock?: Expression

  constructor(condition: Expression<string, BooleanValue>, trueBlock: Expression, falseBlock?: Expression) {
    super('conditional')
    this.condition = condition
    this.trueBlock = trueBlock
    this.falseBlock = falseBlock
  }

  returnType(context?: Scope | undefined): string {
    return this.trueBlock.returnType(context)
  }

  raw() {
    return `if ${this.condition.raw()} ${this.trueBlock.raw()}${
      this.falseBlock ? ` else ${this.falseBlock.raw()}` : ''
    }`
  }

  async execute(context: Scope) {
    const parenthesisResult = await this.condition.execute(context)

    if (!(parenthesisResult instanceof BooleanValue)) {
      throw new Error('Condition must be a boolean')
    } else if (parenthesisResult.value) {
      return await this.trueBlock.execute(context)
    } else if (this.falseBlock) {
      return await this.falseBlock.execute(context)
    }

    return new NoneValue()
  }
}
