import { AddTodoAction, RemoveTodoAction, Todo, TodoActionType } from '@playground/redux/actions'

export function todos(state: Todo[] = [], action: AddTodoAction | RemoveTodoAction) {
  switch (action.type) {
    case TodoActionType.addTodo:
      return [...state, action.payload]
    case TodoActionType.removeTodo:
      return state.filter(todo => todo.id !== action.payload.todoId)
    default:
      return state
  }
}
