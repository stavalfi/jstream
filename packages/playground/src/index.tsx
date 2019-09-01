// import React from 'react'
// import ReactDOM from 'react-dom'
// import { Provider } from 'react-redux'
// import { store } from '@playground/redux/store'
// import Main from '@playground/main'
//
// const rootElement = document.getElementById('app')
// ReactDOM.render(
//   <Provider store={store}>
//     <Main />
//   </Provider>,
//   rootElement,
// )

// import '@playground/workers'

function canceledPromise<T,>(promise: Promise<T>): Promise<T> & { cancel: () => Promise<any> } {
  let isCancelled = false

  const finalPromise = promise.then(
    result => (isCancelled ? Promise.reject('cancelled!') : result),
    error => (isCancelled ? Promise.reject('cancelled!') : error),
  )

  return {
    ...finalPromise,
    cancel: () => {
      isCancelled = true
      return Promise.race([canceledPromise, Promise.reject('cancelled!')])
    },
  }
}

canceledPromise(new Promise(res => setTimeout(res, 2000)))
  .cancel()
  .then(x => console.log('result: ' + x))
  .catch(e => console.log('error: ' + e))
  .finally(() => {
    return console.log('finished')
  })
