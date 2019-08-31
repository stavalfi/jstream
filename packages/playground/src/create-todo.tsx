import React, { FC, useState } from 'react'
import { connect } from 'react-redux'
import { AddTodoActionCreator, addTodoActionCreator } from '@playground/redux/actions'
import { AppState } from '@playground/redux/store'

type DispatchProps = {
  addTodoActionCreator: AddTodoActionCreator
  // addRandomTodoActionCreator: () => Promise<FlowActionByType[FlowActionType.advanceFlowGraph][]>
}

const CreateTodo: FC<DispatchProps> = ({ addTodoActionCreator }) => {
  const [todoName, changeTodoName] = useState<string>('')

  const addTodo = () =>
    addTodoActionCreator({
      id: `${Date.now()}`,
      text: todoName,
    })

  // const addRandomTodo = () => addRandomTodoActionCreator()

  return (
    <section>
      <input type="text" onChange={value => changeTodoName(value.target.value)} />
      <button onClick={addTodo}>Create Todo</button>
      {/*<button onClick={addRandomTodo}>Create Random Todo</button>*/}
    </section>
  )
}

export default connect<{}, DispatchProps, {}, AppState>(
  null,
  { addTodoActionCreator },
)(CreateTodo)
