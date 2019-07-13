import React from 'react'
// @ts-ignore
import DrawFlow from '@editor/draw-flow'
// @ts-ignore
import FlowsEditor from '@editor/flows-editor'
import { ParsedUserConfigurationObject } from '@flow/parser'

interface State {
  selectedFlowIndex?: number
  config: ParsedUserConfigurationObject
}

export default class Home extends React.Component<{}, State> {
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

  setConfig = (config: ParsedUserConfigurationObject) => this.setState({ config })

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
              this.state.hasOwnProperty('selectedFlowIndex')
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
