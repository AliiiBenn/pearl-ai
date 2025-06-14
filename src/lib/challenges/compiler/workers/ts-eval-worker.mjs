import { transpile } from 'typescript'

self.addEventListener('message', async (e) => {
  try {
    // Transpile TypeScript to JavaScript
    const jsCode = transpile(e.data, {
      target: 99, // ESNext
      module: 99, // ESNext
    })

    // Capture console.log output
    let output = ''
    const originalLog = console.log
    console.log = function (...args) {
      output += 
        args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') + '\n'
      originalLog.apply(console, args)
    }

    // Execute the transpiled code
    eval(jsCode)

    // Restore console.log
    console.log = originalLog

    self.postMessage({ success: true, output })
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: error.message, 
      output: '' 
    })
  }
})

export {}
