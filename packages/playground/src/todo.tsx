import React, { FC } from 'react'
import { connect } from 'react-redux'
import { createSelector, createStructuredSelector } from 'reselect'
import { AppState } from '@playground/redux/store'
import { RemoveTodoActionCreator, removeTodoActionCreator, Todo } from '@playground/redux/actions'

type Props = {
  todoId: string
}

type ConnectedProps = {
  todo?: Todo
}

type DispatchProps = {
  removeTodoActionCreator: RemoveTodoActionCreator
}

const defaultTodo = { id: '', text: '' }
const SingleTodo: FC<ConnectedProps & DispatchProps> = ({ todo = defaultTodo, removeTodoActionCreator }) => (
  <div>
    {todo.id} - {todo.text}
    <button onClick={() => removeTodoActionCreator(todo.id)}>Remove Todo</button>
  </div>
)

export default connect<ConnectedProps, DispatchProps, Props, AppState>(
  createStructuredSelector<AppState, Props, ConnectedProps>({
    todo: createSelector<AppState, Props, string, AppState['todos'], Todo | undefined>(
      (state, props) => props.todoId,
      state => state.todos,
      (todoId, todos) => todos.find(todo => todo.id === todoId),
    ),
  }),
  { removeTodoActionCreator },
)(SingleTodo)
