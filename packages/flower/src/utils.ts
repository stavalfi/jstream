import { ActiveFlow, Flow } from '@flower/types'

type GetFlowDetails = (
  flows: Flow[],
  activeFlows: ActiveFlow[],
  activeFlowId: string,
) =>
  | {}
  | ({
      activeFlow: ActiveFlow
      activeFlowIndex: number
    } & (
      | {}
      | {
          flow: Flow
          flowIndex: number
        }
    ))

export const getFlowDetails: GetFlowDetails = (flows, activeFlows, activeFlowId) => {
  const activeFlowIndex = activeFlows.findIndex(activeFlow => activeFlow.id === activeFlowId)
  if (activeFlowIndex === -1) {
    return {}
  }

  const flowIndex = flows.findIndex(flow => flow.id === activeFlows[activeFlowIndex].flowId)

  if (flowIndex === -1) {
    return { activeFlowIndex, activeFlow: activeFlows[activeFlowIndex], flowIndex }
  }

  return {
    flow: flows[flowIndex],
    flowIndex,
    activeFlow: activeFlows[activeFlowIndex],
    activeFlowIndex,
  }
}

export function findByNodeOrDefault<T>(
  array: T[],
  predicate: (t1: T) => boolean,
  defaultPredicate: (t1: T) => boolean,
): T | undefined {
  const element = array.find(predicate)
  return element || array.find(defaultPredicate)
}

export const flatMapPromisesResults = <T>(promises: Promise<T[]>[]): Promise<T[]> =>
  Promise.all(promises).then(array => array.flatMap(array => array))
