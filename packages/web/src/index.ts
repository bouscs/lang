/* @refresh reload */
/// <reference types="vite/client" />

import { Interpreter } from '../../interpreter/src/index.js'
import script from '../../dev/src/script.vi?raw'

const start = async () => {
  console.log('Starting interpreter...')

  const interpreter = new Interpreter()

  console.log(interpreter)

  await interpreter.execute(script)
}

start()
