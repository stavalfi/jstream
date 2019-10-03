import React from 'react'
// import { updateChart } from '@editor/my-d3'
// import deepEqual from 'deep-equal'
import { Configuration } from '@jstream/parser'
import { Flow } from '@jstream/flower'

type Props = {
  config: Required<Configuration<Flow>>
  selectedFlowIndex: number
  height: number
  width: number
}

export default class DrawFlow extends React.Component<Props, {}> {
  // shouldComponentUpdate(nextProps: Props) {
  //   return !deepEqual(
  //     nextProps.config.flows[nextProps.selectedFlowIndex],
  //     this.props.config.flows[this.props.selectedFlowIndex],
  //   )
  // }
  //
  // componentDidMount() {
  //   const { config, selectedFlowIndex, height, width } = this.props
  //   selectedFlowIndex > -1 &&
  //     config.flows.length > selectedFlowIndex &&
  //     updateChart({
  //       svgReact: this.refs.mySvg,
  //       config,
  //       flow: config.flows[selectedFlowIndex],
  //       height,
  //       width,
  //     })
  // }
  //
  // componentDidUpdate() {
  //   const { config, selectedFlowIndex, height, width } = this.props
  //   selectedFlowIndex > -1 &&
  //     config.flows.length > selectedFlowIndex &&
  //     updateChart({
  //       svgReact: this.refs.mySvg,
  //       config,
  //       flow: config.flows[selectedFlowIndex],
  //       height,
  //       width,
  //     })
  // }

  render() {
    // return <svg key={JSON.stringify(this.props.config)} ref={'mySvg'} />
    return <span>abcs</span>
  }
}
