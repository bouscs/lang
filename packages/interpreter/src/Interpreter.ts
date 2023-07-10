import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { Readable, Writable, PassThrough } from 'stream'
import { Scope } from './Scope.js'
import { ExpressionParser } from './ExpressionParser.js'
import { ParenthesisExpression } from './expressions/ParenthesisExpression.js'
import { getBlockInner } from './util.js'

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
  const tokens = [] as Token[][]

  let currentLine = [] as Token[]
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
        currentLine.push({
          parsedType: 'token',
          tokenType: 'single',
          value: currentToken,
          raw: () => currentToken
        })

        currentToken = ''
      }

      currentLine.push({
        parsedType: 'token',
        tokenType: 'single',
        value: character,
        raw: () => character
      })

      continue
    }

    if (charType !== lastCharType) {
      if (currentToken.length > 0) {
        currentLine.push({
          parsedType: 'token',
          tokenType: 'single',
          value: currentToken,
          raw: () => currentToken
        })

        currentToken = ''
      }

      currentToken += character

      continue
    }

    currentToken += character
  }

  if (currentToken.length > 0) {
    currentLine.push({
      parsedType: 'token',
      tokenType: 'single',
      value: currentToken,
      raw: () => currentToken
    })
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

export interface ParseLineOptions {
  tokens: Token[]
  tokenLines: Token[][]
  scope: Scope
  parsers: ExpressionParser[]
  parse: typeof Interpreter.prototype.parse
}

export type LineParser = (options: ParseLineOptions) => Promise<ParsedLine>

const parseLine: LineParser = async options => {
  const { tokens, scope } = options

  let parser: ExpressionParser | undefined = undefined

  for (const parserCandidate of options.parsers) {
    if (parserCandidate.match(options.tokens)) {
      parser = parserCandidate
      break
    }
  }

  if (!parser) {
    return {
      parsedType: 'none',
      content: tokens,
      raw: () => tokens.map(t => t.raw()).join('')
    }
  }

  const parsedLine = await parser.parseLine(options)

  return parsedLine
}

export class Interpreter {
  parsers = [new ParenthesisExpression()] as ExpressionParser[]

  async parse(code: ParsedLine[], scope: Scope) {
    // const lines = toLines(code)

    const parsedLines = [] as ParsedLine[]

    // for (const tokens of code) {
    //   const parsedLine = await parseLine({
    //     tokens,
    //     tokenLines: code,
    //     scope,
    //     parsers: this.parsers.slice(),
    //     parse: this.parse.bind(this)
    //   })

    //   parsedLines.push(parsedLine)
    // }

    while (code.some(p => p.parsedType === 'token')) {
      console.log(JSON.stringify({ code }, null, 2))
      let parsed = false
      for (const parserCandidate of this.parsers) {
        if (parserCandidate.match(code)) {
          await parserCandidate.parse({
            code,
            scope,
            parse: this.parse.bind(this)
          })

          parsed = true

          break
        }
      }

      if (!parsed) {
        return code
        // throw new Error(`Could not parse line: ${code.map(c => c.raw()).join('')}`)
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

    console.log('\n\nExecuting module:\n\n')
    console.log(code)
    console.log('\n\n')

    const scope = new Scope()

    scope.createDataType('symbol')
    scope.createDataType('expression')
    scope.createDataType('type')

    const cleanedCode = cleanCode(code)

    console.log(
      '\n\n',
      JSON.stringify(
        {
          original: code,
          cleanedCode
        },
        null,
        2
      ),
      '\n\n'
    )

    const tokenLines = tokenize(cleanedCode)

    const parsed = await this.parse(tokenLines, scope)

    console.log('\n\nparsed\n', JSON.stringify(parsed, null, 2), '\n\n')

    pass.unpipe(stdout)
    pass.end()
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
