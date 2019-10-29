import React, { Dispatch, FC, useEffect } from 'react'
import AceEditor from 'react-ace'
import 'brace/mode/json'
import 'brace/theme/github'
import { Actions } from '@editor/main/reducer'
import { Configuration } from '@jstream/parser'
import { Flow } from '@jstream/flower'

type Props = {
  error: string | false
  configAsString: string | false
  config: Required<Configuration<Flow>> | false
  dispatch: Dispatch<Actions>
}

const FlowsEditor: FC<Props> = ({ error, configAsString, config, dispatch }) => {
  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }, [error])
  useEffect(() => {
    if (config) {
      // eslint-disable-next-line no-console
      console.log(config)
    }
  }, [config])
  const handleKeyDown = (event: any) => {
    let charCode = String.fromCharCode(event.which).toLowerCase()
    if (event.metaKey && charCode === 'k') {
      dispatch({
        type: 'prettify-string-config',
      })
    }
  }

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown}>
      <EditorButtons config={config} dispatch={dispatch} />
      <AceEditor
        height={'90vh'}
        width={'45vw'}
        mode="json"
        theme="github"
        name="blah2"
        editorProps={{ $blockScrolling: true }}
        onChange={configAsString =>
          dispatch({
            type: 'set-string-config',
            payload: configAsString,
          })
        }
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={configAsString || ''}
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

export default FlowsEditor

const getFlowName = (flow: Flow, index: number) => {
  if ('name' in flow) {
    return flow.name
  }
  return `__FLOW_WITH_NO_NAME_${index}`
}

const EditorButtons: FC<Pick<Props, 'config' | 'dispatch'>> = ({ config, dispatch }) => {
  return config ? (
    <div>
      {config.flows.map((flow, i) => (
        <button
          key={flow.id}
          onClick={() =>
            dispatch({
              type: 'set-selected-flow-index',
              payload: i,
            })
          }
        >
          {getFlowName(flow, i)}
        </button>
      ))}
    </div>
  ) : (
    <div />
  )
}
