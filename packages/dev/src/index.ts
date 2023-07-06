import { Interpreter } from 'interpreter'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const interpreter = new Interpreter()

const start = async () => {
  const filePath = join(__dirname, 'script.vi')
  const result = await interpreter.executeFile(filePath)

  console.log('Execution complete')

  console.log(result)
}

start()
