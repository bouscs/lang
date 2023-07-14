import { Expression, ParserOptions } from '../Expression.js'
import { Scope } from '../Scope.js'
import { Value } from '../Value.js'
import { TokenExpression } from './TokenExpression.js'

const fuckingRegex = /please|ass|shit|fuck(?:ing)?/

export class FuckingExpression extends Expression {
  static match(code: Expression[]) {
    return code.some((e, i) => {
      const [e1, e2, e3, e4, e5] = code.slice(i, i + 5)

      return (
        fuckingRegex.test(e.raw()) ||
        (e1.raw() === 'for' && /^\w+s$/.test(e2.raw()) && e3.raw() === 'sake') ||
        (e1.raw() === 'for' &&
          e2.raw() === 'the' &&
          e3.raw() === 'love' &&
          e4.raw() === 'of' &&
          /^\w+$/.test(e5.raw())) ||
        (e1.raw() === 'you' && /^\w+$/.test(e2.raw()))
      )
    })
  }

  static async validate(code: Expression[]) {
    return true
  }

  static async parse(options: ParserOptions) {
    const { code } = options

    const youIndex = code.findLastIndex((e, i) => {
      const [e1, e2] = code.slice(i, i + 2)

      return e1.raw() === 'you' && /^\w+$/.test(e2.raw())
    })

    if (youIndex !== -1) {
      code.splice(youIndex, 2)

      while (code[youIndex].raw() === '\n' && code[youIndex + 1].raw() === '\n') code.splice(youIndex, 1)

      return
    }

    const loveIndex = code.findLastIndex((e, i) => {
      const [e1, e2, e3, e4, e5] = code.slice(i, i + 5)

      return (
        e1.raw() === 'for' && e2.raw() === 'the' && e3.raw() === 'love' && e4.raw() === 'of' && /^\w+$/.test(e5.raw())
      )
    })

    if (loveIndex !== -1) {
      code.splice(loveIndex, code[loveIndex + 4].raw() === 'fucking' ? 6 : 5)
      while (code[loveIndex].raw() === '\n' && code[loveIndex + 1].raw() === '\n') code.splice(loveIndex, 1)
    } else {
      const sakeIndex = code.findLastIndex((e, i) => {
        const [e1, e2, e3] = code.slice(i, i + 3)

        return e1.raw() === 'for' && /^\w+s$/.test(e2.raw()) && e3.raw() === 'sake'
      })

      if (sakeIndex !== -1) {
        code.splice(sakeIndex, 3)
        while (code[sakeIndex].raw() === '\n' && code[sakeIndex + 1].raw() === '\n') code.splice(sakeIndex, 1)

        return
      }

      const index = code.findLastIndex(e => fuckingRegex.test(e.raw()))

      code.splice(index, 1)
      while (code[index].raw() === '\n' && code[index + 1].raw() === '\n') code.splice(index, 1)
    }
  }

  inner: Expression

  constructor(inner: Expression) {
    super('fucking')

    this.inner = inner
  }

  raw(): string {
    return `fucking ${this.inner.raw()}`
  }

  returnType(context?: Scope | undefined): string {
    return this.inner.returnType()
  }

  async execute(context: Scope) {
    return await this.inner.execute(context)
  }
}
