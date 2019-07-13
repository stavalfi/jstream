export const recordActionsEnhancer = createStore => (...args) => {
  const store = createStore(...args)
  const actions = []
  return {
    ...store,
    dispatch: action => {
      actions.push(action)
      return store.dispatch(action)
    },
    getActions: () => actions,
  }
}
