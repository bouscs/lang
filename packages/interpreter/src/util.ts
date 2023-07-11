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
  return /[a-zA-Z_$][a-zA-Z_$0-9]*/.test(token)
}

export const range = (length: number, start = 0) => {
  return Array.from({ length }, (_, index) => index + start)
}
