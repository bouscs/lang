import { Value } from './Value.js'

/**
 * A token is a slice of a code string that is to be processed as a single unit.
 */
export class CodeToken extends String {
  readonly value: string
  readonly position: number

  /**
   * @param value Full token in string form
   * @param position Position of the token in the code string, starting from the token's first character
   */
  constructor(value: string, position: number) {
    super(value)

    this.position = position
  }
}

export interface TokenProcessorState {
  string: CodeString
  buffer: string

  clearBuffer(): void
  continue(): void
  next(): void
  end(): void
}

export interface TokenProcessor {
  (options: TokenProcessorState): void
}
export class TokenProcessorValue extends Value {
  constructor(public value: TokenProcessor) {
    super('tokenProcessor')
  }

  clone(): Value {
    return new TokenProcessorValue(this.value)
  }

  raw(): string {
    return this.value.toString()
  }

  type(): string {
    return 'tokenProcessor'
  }
}
export class CodeString {
  readonly initial: string

  currentIndex: number

  value: string

  constructor(value: string) {
    this.initial = value
    this.value = value
    this.currentIndex = 0
  }

  /**
   * Finds the next token in the code string.
   * @returns The next token in the code string
   */
  nextToken(processors: TokenProcessor[], initialLength = 0) {
    let current = 0
    let found = false
    let token: string | undefined = undefined as any

    const process = (processor: TokenProcessor, state: TokenProcessorState) => {
      processor(state)

      // if (!found) state.next()
    }

    process(processors[current], {
      string: this,
      buffer: '',
      clearBuffer() {
        this.buffer = ''
      },
      continue() {
        this.buffer += this.string.value[0]
      },
      next() {
        current++

        if (current >= processors.length) return

        process(processors[current], this)
      },
      end() {
        token = this.buffer
        found = true
      }
    })

    if (!processors.length) throw new Error('No processors provided')
    if (token === undefined) {
      this.nextToken(processors, initialLength + 1)
    }

    this.consume((token as string).length)

    return new CodeToken(token!, this.currentIndex) as CodeToken
  }

  /**
   * Consumes (erases) the first `length` characters of the code string.
   * @param length Number of characters to consume
   */
  consume(length: number) {
    this.value = this.value.slice(length)

    this.currentIndex += length
  }

  /**
   * Returns the nth line of the code string.
   * @param index Line index
   */
  line(index = 0) {
    for (let i = 0; i < this.value.length; i++) {}
  }
}
