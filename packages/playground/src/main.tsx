import React, { FC } from 'react'
import Todos from '@playground/todos'
import CreateTodo from '@playground/create-todo'
import { hot } from 'react-hot-loader/root'

const Main: FC<{}> = () => (
  <section>
    <CreateTodo />
    <Todos />
  </section>
)

export default hot(Main)
