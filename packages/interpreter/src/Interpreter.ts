import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { Readable, Writable, PassThrough } from 'stream'
import { Scope } from './Scope.js'
import { ParenthesisExpression } from './expressions/ParenthesisExpression.js'
import { getBlockInner, range } from './util.js'
import { Expression, ExpressionConstructor } from './Expression.js'
import { TokenExpression } from './expressions/TokenExpression.js'
import { SymbolExpression } from './expressions/SymbolExpression.js'
import { NumberLiteralExpression } from './expressions/NumberLiteralExpression.js'
import { AssignmentExpression } from './expressions/AssignmentExpression.js'
import { StatementExpression } from './expressions/StatementExpression.js'
import { CallExpression } from './expressions/CallExpression.js'
import { ModuleExpression } from './expressions/ModuleExpression.js'
import { CallableValue } from './values/CallableValue.js'
import { NumberValue } from './values/NumberValue.js'
import { Value } from './Value.js'
import { BooleanLiteralExpression } from './expressions/BooleanLiteralExpression.js'
import { PlusOperationExpression } from './expressions/arithmetic/PlusOperationExpression.js'
import { MinusOperationExpression } from './expressions/arithmetic/MinusOperationExpression.js'
import { MultiplicationExpression } from './expressions/arithmetic/MultiplicationExpression.js'
import { DivisionExpression } from './expressions/arithmetic/DivisionExpression.js'
import { EqualExpression } from './expressions/comparators/EqualExpression.js'
import { NotEqualExpression } from './expressions/comparators/NotEqualExpression.js'
import { GreaterThanExpression } from './expressions/comparators/GreaterThanExpression.js'
import { GreaterThanOrEqualExpression } from './expressions/comparators/GreaterThanOrEqualExpression.js'
import { LessThanExpression } from './expressions/comparators/LessThanExpression.js'
import { LessThanOrEqualExpression } from './expressions/comparators/LessThanOrEqualExpression.js'
import { StringLiteralExpression } from './expressions/StringLiteralExpression.js'
import { BlockExpression } from './expressions/BlockExpression.js'
import { ConditionalExpression } from './expressions/ConditionalExpression.js'

export type Token = {
  parsedType: 'token'
} & ParsedLine &
  (SingleToken | BlockToken)

export interface SingleToken {
  value: string
  tokenType: 'single'
}

export interface BlockToken {
  value: Token[][]
  openCharacter: string
  tokenType: 'block'
}

export interface ParseResult {
  value: any
  type: string
  tokenCount: number
}

export interface ParsedLine {
  parsedType: string
  raw(): string
}

export interface ParsedInternalLine {
  parsedType: 'internal'
}

export interface ExecuteOptions {
  modulePath?: string
  stdout?: Writable
  stdin?: Readable
  stderr?: Writable
}

export interface ExecuteFileOptions {
  stdout?: Writable
  stdin?: Readable
  stderr?: Writable
}

const charTypes = {
  useless: '\r',
  singleOnly: ' \n\t',
  whitespace: ' \t',
  newline: '\n',
  tab: '\t',
  word: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_',
  number: '0123456789',
  block: '(){}[]',
  symbol: '(){}[]+-*/%&|!@#$^=<>?:;,.~"\'\\'
}

const getCharType = (char: string) => {
  if (charTypes.useless.includes(char)) {
    return 'useless'
  }
  if (charTypes.whitespace.includes(char)) {
    return 'whitespace'
  }
  if (charTypes.newline.includes(char)) {
    return 'newline'
  }
  if (charTypes.tab.includes(char)) {
    return 'tab'
  }
  if (charTypes.word.includes(char)) {
    return 'word'
  }
  if (charTypes.number.includes(char)) {
    return 'number'
  }
  if (charTypes.block.includes(char)) {
    return 'block'
  }

  return 'symbol'
}

const cleanCode = (code: string) => {
  const chars = code
    .trim()
    .replace(/(?<nl>\r\n|\n|\r)+/g, '\n')
    .replace(/(?<tab>\t)+/g, '\t')
    .replace(/(?<space> )+/g, ' ')
    .split('')
    .filter((char, index, chars) => {
      // if (charTypes.whitespace.includes(char)) {
      //   const prevChar = chars[index - 1]
      //   const nextChar = chars[index + 1]

      //   const prevCharType = getCharType(prevChar)
      //   const nextCharType = getCharType(nextChar)

      //   if (prevCharType !== nextCharType) {
      //     return false
      //   }
      // }

      return true
    })

  return chars.join('')
}

const tokenize = (code: string) => {
  const tokens = [] as TokenExpression[][]

  let currentLine = [] as TokenExpression[]
  let currentToken = ''

  const blockTokens = {
    '(': ')',
    '[': ']',
    '{': '}'
  }

  for (let i = 0; i < code.length; i++) {
    const character = code[i]

    if (character === '"') {
      if (currentToken.length > 0) {
        currentLine.push(new TokenExpression(currentToken))

        currentToken = ''
      }

      let string = '"'

      for (let j = i + 1; j < code.length; j++) {
        const char = code[j]

        string += char

        if (char === '"') {
          i = j

          break
        }
      }

      currentLine.push(new TokenExpression(string))

      continue
    }

    if (character === ' ') {
      if (currentToken.length > 0) {
        currentLine.push(new TokenExpression(currentToken))

        currentToken = ''
      }

      continue
    }

    const charType = getCharType(character)
    const lastCharType = getCharType(currentToken[currentToken.length - 1])

    if (charTypes.singleOnly.includes(character)) {
      if (currentToken.length > 0) {
        currentLine.push(new TokenExpression(currentToken))

        currentToken = ''
      }

      currentLine.push(new TokenExpression(character))

      continue
    }

    if (charType !== lastCharType) {
      if (currentToken.length > 0) {
        currentLine.push(new TokenExpression(currentToken))

        currentToken = ''
      }

      currentToken += character

      continue
    }

    currentToken += character
  }

  if (currentToken.length > 0) {
    currentLine.push(new TokenExpression(currentToken))
  }

  if (currentLine.length > 0) {
    tokens.push(currentLine)
  }

  return tokens.flat()
}

const toLines = (code: string) => {
  return code
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

export class Interpreter {
  parsers: ExpressionConstructor[] = [
    // literals
    NumberLiteralExpression,
    BooleanLiteralExpression,
    StringLiteralExpression,
    SymbolExpression,
    // blocks
    ParenthesisExpression,
    BlockExpression,
    // operators
    MultiplicationExpression,
    DivisionExpression,
    PlusOperationExpression,
    MinusOperationExpression,
    // comparisons
    EqualExpression,
    NotEqualExpression,
    GreaterThanExpression,
    GreaterThanOrEqualExpression,
    LessThanExpression,
    LessThanOrEqualExpression,
    // expressions
    CallExpression,
    ConditionalExpression,
    // statements
    AssignmentExpression,
    StatementExpression
  ]

  async parse(code: Expression[]) {
    while (code.some(p => p instanceof TokenExpression)) {
      let parsed = false

      for (const parserCandidate of this.parsers) {
        if (parserCandidate.match(code)) {
          await parserCandidate.parse({
            code,
            parse: this.parse.bind(this)
          })

          parsed = true

          break
        }
      }

      if (!parsed) {
        // return code
        const errorToken = code.findIndex(p => p instanceof TokenExpression)

        if (!errorToken) {
          throw new Error('Unexpected error in code: ', { cause: code.map(p => p.raw()).join() })
        }

        const codeBefore = code.slice(0, errorToken)

        const lineCount = codeBefore.filter(p => p instanceof TokenExpression && p.raw() === '\n').length

        const line = lineCount + 1

        const lastNewline = codeBefore.findLastIndex(p => p instanceof TokenExpression && p.raw() === '\n')

        const codeBeforeLine = codeBefore.slice(lastNewline + 1)

        const column = codeBeforeLine.map(p => p.raw()).join('').length + 1

        const lineCode = codeBeforeLine.map(p => p.raw()).join('') + code[errorToken].raw()

        // console.log(
        //   JSON.stringify(
        //     {
        //       code
        //     },
        //     null,
        //     2
        //   )
        // )

        throw new Error(
          `Could not parse token: "${code[
            errorToken
          ].raw()}" at line ${line}, column ${column}:\n\n${lineCode}\n${range(column - 1)
            .map(() => ' ')
            .join('')}^\n`
        )
      }
    }

    return code
  }

  async execute(code: string, options?: ExecuteOptions) {
    const resolvedModulePath = resolve(options?.modulePath ?? process.cwd())

    const stdout = options?.stdout ?? process.stdout
    const stdin = options?.stdin ?? process.stdin
    const stderr = options?.stderr ?? process.stderr

    const pass = new PassThrough()

    pass.pipe(stdout)

    const scope = new Scope()

    scope.create('print', {
      type: 'callable',
      value: new CallableValue((...args: Value[]) => console.log(...args.map(p => p.toString())))
    })

    const cleanedCode = cleanCode(code)

    const tokenLines = tokenize(cleanedCode)

    const parsed = new ModuleExpression(await this.parse(tokenLines))

    console.log('Parsed code:\n')
    console.log(parsed.raw())

    try {
      const result = await parsed.execute(scope)

      pass.unpipe(stdout)
      pass.end()

      return result
    } catch (error) {
      throw new Error('Failed to execute code', {
        cause: { code: JSON.stringify(parsed, null, 2), error }
      })
    }
  }

  async executeFile(path: string, options?: ExecuteFileOptions) {
    const resolvedPath = resolve(path)

    try {
      const content = await readFile(resolvedPath, 'utf-8')

      const executeOptions: ExecuteOptions = {
        modulePath: resolvedPath,
        stdout: options?.stdout,
        stdin: options?.stdin,
        stderr: options?.stderr
      }

      return await this.execute(content, executeOptions)
    } catch (error) {
      throw new Error('Failed to execute file', {
        cause: error
      })
    }
  }
}
