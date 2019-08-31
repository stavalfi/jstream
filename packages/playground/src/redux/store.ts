import { applyMiddleware, combineReducers, createStore } from 'redux'
import { todos } from '@playground/redux/reducer'
import { AddTodoAction, RemoveTodoAction, Todo } from '@playground/redux/actions'
import thunk, { ThunkDispatch } from 'redux-thunk'
import { logger } from 'redux-logger'
import { FlowAction, FlowState, reducer } from '@jstream/flower'

export type AppState = { todos: Todo[] }

export type AppThunkDispatch = ThunkDispatch<
  FlowState & AppState,
  undefined,
  FlowAction & AddTodoAction & RemoveTodoAction
>

const middleware = applyMiddleware<AppThunkDispatch, FlowState & AppState>(thunk, logger)
export const store = createStore(combineReducers({ flowerState: reducer, todos }), middleware)
