import React, { FC, useEffect, useReducer } from 'react'
import DrawFlow from '@editor/draw-flow'
import FlowsEditor from '@editor/flows-editor'
import { reducer } from '@editor/main/reducer'

const Main: FC<{}> = () => {
  const [state, dispatch] = useReducer(reducer, {})

  useEffect(() => {
    dispatch({
      type: 'set-string-config',
      payload: `"HEAD:a,b:c"`,
    })
  }, [])

  return (
    <div className={'home'}>
      1234590
      {/*<div className={'draw-flow-section'}>*/}
      {/*  <DrawFlow*/}
      {/*    height={600}*/}
      {/*    width={800}*/}
      {/*    config={'config' in state && state.config}*/}
      {/*    selectedFlowIndex={'selectedFlowIndex' in state && state.selectedFlowIndex}*/}
      {/*  />*/}
      {/*</div>*/}
      {/*<div className={'flows-editor-section'}>*/}
      {/*  <FlowsEditor*/}
      {/*    config={'config' in state && state.config}*/}
      {/*    configAsString={'configAsString' in state && state.configAsString}*/}
      {/*    error={'error' in state && state.error}*/}
      {/*    dispatch={dispatch}*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
  )
}

export default Main
