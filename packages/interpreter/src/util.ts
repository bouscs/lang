import { ParsedLine } from './Interpreter.js'

export const getBlockInner = (code: ParsedLine[], openCharacter = '(', closeCharacter = ')', startLevel = 1) => {
  let level = startLevel

  const innerParenthesis = [] as ParsedLine[]

  for (const character of code) {
    if (character.parsedType === 'token' && character.value === openCharacter) {
      level++
    } else if (character.parsedType === 'token' && character.value === closeCharacter) {
      level--
    }

    if (level === startLevel - 1) {
      break
    }

    innerParenthesis.push(character)
  }

  return innerParenthesis
}
