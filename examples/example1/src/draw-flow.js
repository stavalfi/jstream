import React from 'react';
import {updateChart} from './d3';
import deepEqual from 'deep-equal';

export default class DrawFlow extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return !deepEqual(
      nextProps.config.flows[nextProps.selectedFlowIndex],
      this.props.config.flows[this.props.selectedFlowIndex],
    );
  }

  componentDidMount() {
    const {config, selectedFlowIndex, height, width} = this.props;
    selectedFlowIndex > -1 &&
      config.flows.length > selectedFlowIndex &&
      updateChart({
        svgReact: this.refs.mySvg,
        config,
        flow: config.flows[selectedFlowIndex],
        height,
        width,
      });
  }

  componentDidUpdate() {
    const {config, selectedFlowIndex, height, width} = this.props;
    selectedFlowIndex > -1 &&
      config.flows.length > selectedFlowIndex &&
      updateChart({
        svgReact: this.refs.mySvg,
        config,
        flow: config.flows[selectedFlowIndex],
        height,
        width,
      });
  }

  render() {
    return <svg key={JSON.stringify(this.props.config)} ref={'mySvg'} />;
  }
}
