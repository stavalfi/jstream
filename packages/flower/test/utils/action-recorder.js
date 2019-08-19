export const recordActionsEnhancer = createStore => (...args) => {
  const store = createStore(...args)
  const actions = []
  return {
    ...store,
    dispatch: action => {
      actions.push(action)
      return store.dispatch(action)
    },
    getActions: () =>
      actions.map(action => {
        const copy = { ...action }
        delete copy.id
        delete copy.toNode
        delete copy.fromNode
        return copy
      }),
  }
}
