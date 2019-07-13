import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { reducer } from '@flower/index'
import { initialState as initialFlowState } from '@flower/reducer'
import { recordActionsEnhancer } from '@flower-test/utils/action-recorder'

// store with a action recorder enhancer.
export const getStore = (initialState = initialFlowState) => {
  return createStore(
    combineReducers({ libReducer: reducer }),
    {
      libReducer: initialState,
    },
    compose(
      applyMiddleware(thunk),
      recordActionsEnhancer,
    ),
  )
}
