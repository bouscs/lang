import { Interpreter } from 'interpreter'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import { readFile } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const interpreter = new Interpreter()

const start = async () => {
  const filePath = join(__dirname, 'script.vi')
  const file = await readFile(filePath, 'utf-8')
  const result = await interpreter.execute(file)
}

start()
