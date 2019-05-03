import React from 'react';
import DrawFlow from './draw-flow';
import FlowsEditor from './flows-editor';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
        splitters: {},
        flows: [],
      },
    };
  }

  setConfig = config => this.setState({config});

  setSelectedFlowIndex = selectedFlowIndex => this.setState({selectedFlowIndex});

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
                ? this.state.selectedFlowIndex
                : this.state.config.flows.length - 1
            }
          />
        </div>
        <div className={'flows-editor-section'}>
          <FlowsEditor
            onConfigChange={this.setConfig}
            onSelectedFlowIndexChange={this.setSelectedFlowIndex}
          />
        </div>
      </div>
    );
  }
}
