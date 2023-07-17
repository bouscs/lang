/* @refresh reload */
/// <reference types="vite/client" />

import { Interpreter } from '../../interpreter/src/index.js'
import script from '../../dev/src/script.vi?raw'
import { render } from 'solid-js/web'
import { App } from './components/App.jsx'

const start = async () => {
  console.log('Starting interpreter...')

  const interpreter = new Interpreter()

  console.log(interpreter)

  const el = document.querySelector('#render')

  if (!el) {
    throw new Error('Could not find #render element')
  }

  render(App, el)

  await interpreter.execute(script)
}

start()
