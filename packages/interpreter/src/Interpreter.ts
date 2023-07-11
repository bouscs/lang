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
      if (charTypes.whitespace.includes(char)) {
        const prevChar = chars[index - 1]
        const nextChar = chars[index + 1]

        const prevCharType = getCharType(prevChar)
        const nextCharType = getCharType(nextChar)

        if (prevCharType !== nextCharType) {
          return false
        }
      }

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

    // if (character === '\n') {
    //   if (currentToken.length > 0) {
    //     currentLine.push({
    //       parsedType: 'token',
    //       tokenType: 'single',
    //       value: currentToken
    //     })

    //     currentToken = ''
    //   }

    //   tokens.push(currentLine)

    //   currentLine = []

    //   continue
    // }

    const charType = getCharType(character)
    const lastCharType = getCharType(currentToken[currentToken.length - 1])

    // if (Object.keys(blockTokens).includes(character)) {
    //   if (currentToken.length > 0) {
    //     currentLine.push({
    //       tokenType: 'single',
    //       value: currentToken
    //     })

    //     currentToken = ''
    //   }

    //   const inner = getBlockInner(code.slice(i + 1), character, blockTokens[character])

    //   i += inner.length + 1

    //   const tokens = tokenize(inner)

    //   const blockToken: BlockToken = {
    //     tokenType: 'block',
    //     openCharacter: character,
    //     value: tokens
    //   }

    //   currentLine.push(blockToken)

    //   continue
    // }

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
    NumberLiteralExpression,
    BooleanLiteralExpression,
    SymbolExpression,
    ParenthesisExpression,
    AssignmentExpression,
    CallExpression,
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

        console.log(
          JSON.stringify(
            {
              code
            },
            null,
            2
          )
        )

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

    scope.set('print', new CallableValue((...args: Value[]) => console.log(...args.map(p => p.toString()))))

    const cleanedCode = cleanCode(code)

    const tokenLines = tokenize(cleanedCode)

    const parsed = new ModuleExpression(await this.parse(tokenLines))

    console.log(JSON.stringify({ parsed }, null, 2))

    const result = await parsed.execute(scope)

    pass.unpipe(stdout)
    pass.end()

    return result
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
