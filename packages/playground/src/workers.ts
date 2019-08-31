if (typeof Worker !== 'undefined') {
  const worker1 = new Worker('@playground/worker1.js', { type: 'module' })
  worker1.onmessage = ({ data }) => {
    console.log(`page got message: ${data}`)
  }
  worker1.postMessage('hello')
}
