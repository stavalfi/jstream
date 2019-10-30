// @ts-ignore
__HMR__ && require('react-hot-loader')
import 'react-hot-loader'
import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader/root'
// @ts-ignore
import WebAppComponent from 'webapp-main-component-path'

// @ts-ignore
const App: Function = __HMR__ ? hot(WebAppComponent) : WebAppComponent

const rootElement = document.getElementById('app')

// can't run experimental with hmr because hmr need a different react-dom
// which doesn't support experimental features like: `createRoot` function.
// @ts-ignore
__REACT_EXPERIMENTAL__ && !__HMR__
  ? // @ts-ignore
    ReactDOM.createRoot(rootElement).render(<App />)
  : ReactDOM.render(<App />, rootElement)
