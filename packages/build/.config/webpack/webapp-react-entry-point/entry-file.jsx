__HMR__ && require('react-hot-loader')
import 'react-hot-loader'
import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader/root'
import WebAppComponent from 'webapp-main-component-path'

const App = __HMR__ ? hot(WebAppComponent) : WebAppComponent

const rootElement = document.getElementById('app')

// can't run experimental with hmr because hmr need a different react-dom
// which doesn't support experimental features like: `createRoot` function.

__REACT_EXPERIMENTAL__ ? ReactDOM.createRoot(rootElement).render(<App />) : ReactDOM.render(<App />, rootElement)
