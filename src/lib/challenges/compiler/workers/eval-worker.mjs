self.addEventListener('message', (e) => {
  try {
    // Capture console.log output
    let output = ''
    const originalLog = console.log
    console.log = function (...args) {
      output +=
        args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ') +
        '\n'
      originalLog.apply(console, args)
    }

    // Execute the code
    eval(e.data)

    // Restore console.log
    console.log = originalLog

    self.postMessage({ success: true, output })
  } catch (error) {
    self.postMessage({ success: false, error: error.message, output: '' })
  }
})

// Explicitly mark as an ES module (even though it's implied by .mjs)
export {}
