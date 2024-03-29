import { Expression } from './Expression.js'
import { ParsedLine } from './Interpreter.js'
import { TokenExpression } from './expressions/TokenExpression.js'

export const getBlockInner = (code: Expression[], openCharacter = '(', closeCharacter = ')', startLevel = 1) => {
  let level = startLevel

  const innerParenthesis = [] as Expression[]

  for (const character of code) {
    if (character instanceof TokenExpression && character.value === openCharacter) {
      level++
    } else if (character instanceof TokenExpression && character.value === closeCharacter) {
      level--
    }

    if (level === startLevel - 1) {
      break
    }

    innerParenthesis.push(character)
  }

  return innerParenthesis
}

export const isWordToken = (token: string) => {
  return /[a-zA-Z_$][a-zA-Z_$0-9]*/.test(token) && !['if', 'else', 'true', 'false', 'null'].includes(token)
}

export const isDigit = (token: string) => {
  return /^[0-9]+$/.test(token)
}

export const isNumberLiteral = (token: string) => {
  return /^[0-9]+(?:\.[0-9]+)?$/.test(token)
}

export const range = (length: number, start = 0) => {
  return Array.from({ length }, (_, index) => index + start)
}

export const namedClass = (name: string, base: any) =>
  ({
    [name]: class extends base {}
  })[name]
