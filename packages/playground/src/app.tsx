import React from 'react'
import { hot } from 'react-hot-loader/root'
import Editor from '@jstream/editor'
import Hohahoha from '@playground/playground-hoha'

const App: Function = () => (
  <>
    <Hohahoha />
    <Editor />
  </>
)

export default hot(App)
