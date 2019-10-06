import React from 'react'
// @ts-ignore
import DrawFlow from '@editor/draw-flow'
// @ts-ignore
import FlowsEditor from '@editor/flows-editor'
import { Configuration } from '@jstream/parser'
import { Flow } from '@jstream/flower'

interface State {
  selectedFlowIndex?: number
  config: Required<Configuration<Flow>>
}

export default class Editor extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = {
      config: {
        // @ts-ignore
        splitters: {},
        flows: [],
      },
    }
  }

  setConfig = (config: Required<Configuration<Flow>>) =>
    this.setState({ config, ...(config.flows.length > 0 && { selectedFlowIndex: config.flows.length - 1 }) })

  setSelectedFlowIndex = (selectedFlowIndex: number) => this.setState({ selectedFlowIndex })

  render() {
    return (
      <div className={'home'}>
        <div className={'draw-flow-section'}>
          <DrawFlow
            height={600}
            width={800}
            config={this.state.config}
            selectedFlowIndex={
              'selectedFlowIndex' in this.state
                ? (this.state.selectedFlowIndex as number)
                : this.state.config.flows.length - 1
            }
          />
        </div>
        <div className={'flows-editor-section'}>
          <FlowsEditor
            config={this.state.config}
            onConfigChange={this.setConfig}
            onSelectedFlowIndexChange={this.setSelectedFlowIndex}
          />
        </div>
      </div>
    )
  }
}
