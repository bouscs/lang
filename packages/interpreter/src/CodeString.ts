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
  nextToken() {
    // TODO implement next token finding
    const length = 1

    const tokenString = this.value.slice(0, length)

    const token = new CodeToken(tokenString, this.currentIndex)

    return token
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
