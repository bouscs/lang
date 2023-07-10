import { ExpressionParser } from '../ExpressionParser.js'
import { Token, LineParser, ParseLineOptions, ParsedLine, BlockToken, Interpreter } from '../Interpreter.js'
import { Scope } from '../Scope.js'
import { getBlockInner as getBlockInner } from '../util.js'

export interface ParsedParenthesis {
  value: ParsedLine[]
  parsedType: 'parenthesis'
  raw(): string
}

export class ParenthesisExpression extends ExpressionParser {
  match(tokens: Token[]): boolean {
    return tokens.some(t => t.parsedType === 'token' && t.value === '(')
  }

  async parse(options: { code: ParsedLine[]; scope: Scope; parse: typeof Interpreter.prototype.parse }) {
    const { code, scope, parse } = options

    const parenthesisIndex = code.findIndex(t => t.parsedType === 'token' && (t as Token).value === '(')

    console.log(JSON.stringify({ code, parenthesisIndex }, null, 2))

    const innerLines = getBlockInner(code.slice(parenthesisIndex + 1), '(', ')')

    console.log(JSON.stringify({ innerLines }, null, 2))

    const result = await parse(innerLines, scope)

    console.log(JSON.stringify({ result }, null, 2))

    code.splice(parenthesisIndex, innerLines.length + 2, {
      parsedType: 'parenthesis',
      value: result,
      raw: () => `(${innerLines.map(t => t.raw()).join('')})`
    } as ParsedParenthesis)

    console.log(JSON.stringify({ code }, null, 2))
  }

  async parseLine(options: ParseLineOptions): Promise<ParsedParenthesis> {
    const { tokens, scope, parse } = options

    const innerLines = (tokens[0] as BlockToken).value

    const result = await parse(innerLines[0], scope)

    return {
      value: result,
      parsedType: 'parenthesis',
      raw: () => `(${innerLines[0].map(t => t.raw()).join('')})`
    }
  }
}
