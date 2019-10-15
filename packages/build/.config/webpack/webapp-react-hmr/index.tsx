import 'react-hot-loader'
import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader/root'
// @ts-ignore
import WebAppComponent from 'webapp-main-component-path'

const App: Function = hot(WebAppComponent)

ReactDOM.render(<App />, document.getElementById('app'))
