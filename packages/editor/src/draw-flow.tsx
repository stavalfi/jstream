import React, { FC, useEffect, useRef } from 'react'
import { updateChart } from '@editor/my-d3'
import { Configuration } from '@jstream/parser'
import { Flow } from '@jstream/flower'
import _isNumber from 'lodash/isNumber'
type Props = {
  config: Required<Configuration<Flow>> | false
  selectedFlowIndex: number | false
  height: number
  width: number
}

const DrawFlow: FC<Props> = ({ config, selectedFlowIndex, height, width }) => {
  const svg = useRef(null)

  useEffect(() => {
    if (_isNumber(selectedFlowIndex) && config && 0 <= selectedFlowIndex && selectedFlowIndex < config.flows.length) {
      updateChart({
        svgReact: svg.current,
        config,
        flow: config.flows[selectedFlowIndex],
        height,
        width,
      })
    }
  }, [config, height, width, selectedFlowIndex])

  return <svg key={JSON.stringify(config)} ref={svg} />
}

export default DrawFlow
