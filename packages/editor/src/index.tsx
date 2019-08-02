import '@editor/fonts/my-symphony.font.js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from '@editor/app'
import {
  executeFlowThunkCreator,
  FlowReducerSelector,
  FlowState,
  FlowThunkDispatch,
  reducer,
  updateConfigActionCreator,
} from '@jstream/flower'

import { logger } from 'redux-logger'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'
import { parse } from '@jstream/parser'

// @ts-ignore
ReactDOM.render(<App />, document.getElementById('app'))

const middleware = applyMiddleware<FlowThunkDispatch, FlowState>(thunk, logger)
const store = createStore(combineReducers({ libReducer: reducer }), middleware)

const libSelector: FlowReducerSelector = state => state.libReducer
const config = parse({
  splitters: {
    extends: '/',
  },
  flows: [
    {
      name: 'state',
      graph: 'should_start:failed,canceled,succeed,[waiting:failed,canceled,succeed]',
      default_path: 'succeed',
      extends_flows: [
        {
          name: 'download',
          graph: [
            'start_download:resume_download:paused_download,completed_download',
            'paused_download:resume_download',
            'start_download,resume_download,paused_download,completed_download:remove_file:start_download',
          ],
          default_path: 'completed_download',
          rules: [
            {
              node_name: 'start_download',
              next: () => () => () => 'resume_download',
              error: () => () => () => 'paused_download',
            },
            {
              node_name: 'resume_download',
              next: () => () => () => 'completed_download',
              error: () => () => () => 'paused_download',
            },
          ],
        },
        {
          name: 'upload',
          graph: [
            'start_upload:resume_upload:pause_upload:resume_upload',
            'start_upload,resume_upload,pause_upload:remove_file',
          ],
          default_path: 'resume_upload',
          rules: [
            {
              node_name: 'start_upload',
              next: () => () => () => 'resume_upload',
              error: () => () => () => 'pause_upload',
            },
          ],
        },
        {
          name: 'upload_after_download',
          graph: 'download',
        },
        {
          name: 'download_and_upload_concurrently',
          graph: 'download/resume_download:upload',
          rules: [
            {
              node_name: 'download/resume_download',
              next: () => () => () => 'upload/start_upload/upload/start_download/state/should_start',
              error: () => () => () => 'paused_download',
            },
          ],
        },
      ],
    },
  ],
})

store.dispatch(updateConfigActionCreator(config))
store.dispatch(executeFlowThunkCreator(libSelector)({ name: 'download_and_upload_concurrently' }))
