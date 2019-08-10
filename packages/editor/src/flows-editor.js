import React from 'react'
import AceEditor from 'react-ace'
// eslint-disable-next-line import/no-extraneous-dependencies
import 'brace/mode/json'
// eslint-disable-next-line import/no-extraneous-dependencies
import 'brace/theme/github'
import Jsonic from 'jsonic'
import dJSON from 'dirty-json'
import { parse } from '@jstream/parser'
import deepEqual from 'deep-equal'

export default class FlowsEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      config: '',
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      deepEqual(nextProps, this.props) ||
      deepEqual(nextState.error, this.state.error) ||
      deepEqual(nextState, this.state)
    )
  }

  stringToObject = newConfig => {
    try {
      return Jsonic(newConfig)
    } catch (e) {
      try {
        return dJSON.parse(newConfig)
      } catch (e1) {
        return ''
      }
    }
  }

  onChange = newConfig => {
    try {
      const json = this.stringToObject(newConfig)
      const configObject = parse(json)
      return this.setState({ config: newConfig, error: false }, () => {
        this.props.onConfigChange(configObject)
      })
    } catch (e) {
      return this.setState({ config: newConfig, error: e })
    }
  }

  handleKeyDown = event => {
    let charCode = String.fromCharCode(event.which).toLowerCase()
    if (event.metaKey && charCode === 'k') {
      this.setState(lastState => {
        if (lastState.error) {
          return {}
        } else {
          const config = JSON.stringify(this.stringToObject(lastState.config), null, '\t')
          return { config }
        }
      })
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(
      'allowed props in flow: \n',
      `UserFlow: {
      name?: string
      graph: UserGraph
      default_path?: string
      extends_flows?: UserFlow[]
    }`,
    )
    if (this.state.error) {
      console.log(this.state.error)
    } else {
      const json = this.stringToObject(this.state.config)
      const configObject = parse(json)
      console.log(configObject)
    }
  }

  getFlowName = (flow, index) => {
    if (flow.hasOwnProperty('name')) {
      return flow.name
    }
    return `__FLOW_WITH_NO_NAME_${index}`
  }

  renderButtons = () => {
    return (
      <div>
        {this.props.config.flows.map((flow, i) => (
          <button key={flow.id} onClick={() => this.props.onSelectedFlowIndexChange(i)}>
            {this.getFlowName(flow, i)}
          </button>
        ))}
      </div>
    )
  }

  render() {
    return (
      <div tabIndex={0} onKeyDown={this.handleKeyDown}>
        {this.renderButtons()}
        <AceEditor
          height={'90vh'}
          width={'45vw'}
          mode="json"
          theme="github"
          name="blah2"
          editorProps={{ $blockScrolling: true }}
          onChange={change => this.onChange(change)}
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          value={this.state.config}
          setOptions={{
            enableLiveAutocompletion: true,
            enableBasicAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </div>
    )
  }
}
