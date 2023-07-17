export class CleanedCodeString {
  [Symbol.toPrimitive]() {
    return this.toString()
  }

  toString() {
    return this.valueOf()
  }

  valueOf() {
    return this as unknown as string
  }

  value: string
  mapping: ReadonlyArray<number>
  original: CodeString

  constructor(cleaned: string, mapping: ReadonlyArray<number>, original: CodeString) {
    this.value = cleaned
    this.mapping = mapping
    this.original = original
  }

  getOriginalPosition(cleanedPosition: number) {
    return this.mapping[cleanedPosition]
  }
}

export class CodeString {
  value: string
  constructor(value: string) {
    this.value = value
  }

  static isCodeString(value: unknown): value is CodeString {
    return value instanceof CodeString
  }

  firstLine() {
    return this.value.split('\n')[0]
  }

  toCleaned() {
    const cleaned = this.value.slice().replace(/\s+/g, ' ').trim()
    const mapping: number[] = []
    let originalPosition = 0
    let cleanedPosition = 0

    while (originalPosition < this.value.length) {
      if (this[originalPosition] === ' ') {
        mapping[cleanedPosition] = originalPosition
        originalPosition++
      } else {
        mapping[cleanedPosition] = originalPosition
        originalPosition++
        cleanedPosition++
      }
    }

    return new CleanedCodeString(cleaned, mapping, this)
  }
}
