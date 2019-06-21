import React from 'react'
import AceEditor from 'react-ace'
import 'brace/mode/json'
import 'brace/theme/github'
import Jsonic from 'jsonic'
import dJSON from 'dirty-json'
import { parse } from '@flow/parser'

export default class FlowsEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      config: '',
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.onConfigChange !== this.props.onConfigChange ||
      nextProps.config !== this.props.config ||
      nextState.config !== this.state.config
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
    console.log('newConfig: ', newConfig)
    console.log(
      'allowed props in flow: \n',
      `UserFlow: {
      name?: string
      graph: UserGraph
      default_path?: string
      extends_flows?: UserFlow[]
    }`,
    )
    try {
      const json = this.stringToObject(newConfig)
      const configObject = parse(json)
      return this.setState({ config: newConfig, error: false }, () => {
        console.log(configObject)
        this.props.onConfigChange(configObject)
      })
    } catch (e) {
      return this.setState({ config: newConfig, error: e }, () => console.log(e))
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

  getFlowName = (flow, index) => {
    if (flow.hasOwnProperty('name')) {
      return flow.name
    }
    return `composed-flow${index}`
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
