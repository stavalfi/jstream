import React, { FC } from 'react'
import { connect } from 'react-redux'
import { createSelector, createStructuredSelector } from 'reselect'
import { AppState } from '@playground/redux/store'
import SingleTodo from '@playground/todo'
import { Todo } from '@playground/redux/actions'
import { identity } from 'rxjs'

type ConnectedProps = {
  todos: Todo[]
}

const Todos: FC<ConnectedProps> = ({ todos = [] }) => (
  <section>
    {todos.map(todo => (
      <SingleTodo key={todo.id} todoId={todo.id} />
    ))}
  </section>
)

export default connect<ConnectedProps, {}, {}, AppState>(
  createStructuredSelector<AppState, {}, ConnectedProps>({
    todos: createSelector<AppState, {}, AppState['todos'], AppState['todos']>(
      state => state.todos,
      identity,
    ),
  }),
)(Todos)
