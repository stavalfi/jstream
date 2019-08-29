import React from 'react'
import { hot } from 'react-hot-loader/root'
import MyComponent from '@playground/my-component'

const App: Function = () => (
  <>
    <MyComponent />
    {/*<Something />*/}
  </>
)

export default hot(App)
