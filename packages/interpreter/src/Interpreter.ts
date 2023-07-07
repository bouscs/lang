import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { Readable, Writable, PassThrough } from 'stream'
import { Scope } from './Scope.js'

export interface Token {
  value: string
}

export interface ParseResult {
  value: any
  type: string
  tokenCount: number
}

export type LineParser = (ctx: {
  code: Token[]
  scope: Scope
  parse: (code: Token[], scope: Scope) => Promise<ParseResult>
}) => Promise<ParseResult | false>

const blockParser: (options: { endCharacter: string }) => LineParser =
  options =>
  async ({ code, scope, parse }) => {
    let nextToken: Token | undefined

    const results = [] as ParseResult[]

    while (nextToken?.value !== options.endCharacter) {
      nextToken = code[0]
      console.log('blockParser nextToken', nextToken)
      if (!nextToken) {
        throw new Error('Unexpected end of code')
      }
      const result = await parse(code, scope)

      console.log('blockParser result', result)

      if (result.tokenCount !== code.length) results.push(result)
      code = code.slice(1)
    }

    return {
      value: results,
      type: 'block',
      tokenCount: results.reduce((acc, result) => acc + result.tokenCount, 0)
    }
  }

const parenthesisExpressionParser: LineParser = async ({ code, scope, parse }) => {
  console.log('parenthesisExpressionParser code', code)
  const newLine = code.findIndex(token => token.value === '\n')
  console.log('parenthesisExpressionParser newLine', newLine)
  let line: Token[]
  if (newLine === -1) {
    line = code
  } else {
    line = code.slice().splice(0, newLine)
  }
  console.log('parenthesisExpressionParser', line)
  const match = line.findIndex(token => token.value === '(')

  if (match === -1) {
    console.log('parenthesisExpressionParser no match')
    return false
  }

  const tokenIndex = match

  const result = await blockParser({
    endCharacter: ')'
  })({
    code: code.slice(tokenIndex + 1),
    scope,
    parse
  })

  console.log('parenthesisExpressionParser result', result)

  if (!result) {
    return false
  }

  return {
    value: result,
    type: 'parenthesis',
    tokenCount: tokenIndex + result.tokenCount + 2
  }
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

export class Interpreter {
  async tokenize(code: string) {
    const tokens = [] as Token[]

    let currentToken = ''

    // TODO - limpar o código antes de tokenizar: remover comentários, espaços desnecessários, newlines desnecessários

    // TODO retornar lista de linhas, não de tokens

    const separators = ['(', ')', '\r', '\n', '\t']

    for (const character of code) {
      if (character === ' ') {
        if (currentToken.length > 0) {
          tokens.push({
            value: currentToken
          })

          currentToken = ''
        }

        continue
      }

      if (separators.includes(character)) {
        if (currentToken.length > 0) {
          tokens.push({
            value: currentToken
          })

          currentToken = ''
        }

        tokens.push({
          value: character
        })

        continue
      }

      currentToken += character
    }

    if (currentToken.length > 0) {
      tokens.push({
        value: currentToken
      })
    }

    return tokens.filter(Boolean).filter(t => t.value !== '\r')
  }

  async parse(code: Token[], scope: Scope): Promise<ParseResult> {
    console.log('\n\nTrying to parse code:\n\n', code, '\n\n')
    const parsers = [parenthesisExpressionParser]

    const lines: ParseResult[] = []

    do {
      if (code[0].value === '\n') {
        code = code.slice(1)
      }
      let line: ParseResult | undefined

      for (const parser of parsers) {
        const result = await parser({
          code,
          scope,
          parse: this.parse.bind(this)
        })

        if (result) {
          line = result
        }
      }

      // o certo é isso:
      // throw new Error('Failed to parse code')

      if (!line) {
        const newLine = code.findIndex(token => token.value === '\n')
        if (newLine === -1) {
          break
        }

        const lineCode = code.slice(0, newLine)

        code = code.slice(lineCode.length + 1)

        console.log('lineCode', lineCode)
        console.log('new code', code)

        line = {
          value: lineCode,
          type: 'statement',
          tokenCount: 1
        }

        console.log('line', line)
      } else {
        code = code.slice(line.tokenCount)
      }

      lines.push(line)
    } while (code[0]?.value === '\n')

    return {
      value: lines,
      type: 'expression',
      tokenCount: lines.reduce((acc, line) => acc + line.tokenCount, 0)
    }
  }

  async execute(code: string, options?: ExecuteOptions) {
    const resolvedModulePath = resolve(options?.modulePath ?? process.cwd())

    const stdout = options?.stdout ?? process.stdout
    const stdin = options?.stdin ?? process.stdin
    const stderr = options?.stderr ?? process.stderr

    const pass = new PassThrough()

    pass.pipe(stdout)

    pass.write('\n\nExecuting module:\n\n')
    pass.write(code)
    pass.write('\n\n')

    const scope = new Scope()

    scope.createDataType('symbol')
    scope.createDataType('expression')
    scope.createDataType('type')

    const tokens = await this.tokenize(code)

    console.log('tokens', tokens.map(t => t.value).join(';'))

    const result = await this.parse(tokens, scope)

    if (!result) {
      throw new Error('Failed to parse code')
    }

    console.log('\n\nParsed code:\n\n', JSON.stringify(result, null, 2), '\n\n')

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
