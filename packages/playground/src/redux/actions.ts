import { Action } from 'redux'
import { executeFlowThunkCreator, ExecuteFlowThunk } from '@jstream/flower'
import { libSelector } from '@playground/redux/selectors'

export type AddRandomTodoActionCreator = () => ExecuteFlowThunk
export const addRandomTodoActionCreator: AddRandomTodoActionCreator = () =>
  executeFlowThunkCreator(libSelector)({
    name: 'add-random',
  })

export enum TodoActionType {
  addTodo = 'add-todo',
  removeTodo = 'remove-todo',
}

export interface Todo {
  id: string
  text: string
}

export interface AddTodoAction extends Action<TodoActionType.addTodo> {
  payload: Todo
}

export type AddTodoActionCreator = (todo: Todo) => AddTodoAction

export const addTodoActionCreator: AddTodoActionCreator = todo => ({
  type: TodoActionType.addTodo,
  payload: todo,
})

export interface RemoveTodoAction extends Action<TodoActionType.removeTodo> {
  payload: {
    todoId: string
  }
}

export type RemoveTodoActionCreator = (todoId: string) => RemoveTodoAction

export const removeTodoActionCreator: RemoveTodoActionCreator = todoId => ({
  type: TodoActionType.removeTodo,
  payload: {
    todoId,
  },
})
