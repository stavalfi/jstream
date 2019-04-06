// import isPromise from 'is-promise';
// import byPath from 'object-path';
// import {concat, from, isObservable, of} from 'rxjs';
// import {map, reduce} from 'rxjs/operators';
// import {advanceFlow} from '../src/redux-extension/actions';

export default props => ({
  splitters: {
    extends: '/',
  },
  flows: [
    'should_start',
    'waiting',
    'failed',
    'cancelling',
    'canceled',
    'succeed',
    {
      name: 'default_workflow_state_machine',
      graph: 'should_start:failed,[cancelling:canceled],succeed',
    },
    {
      name: 'flow1',
      graph: 'should_start:failed,canceled,succeed,[waiting:failed,canceled,succeed]',
      side_effects: [
        {
          node_name: 'should_start',
          side_effect: workflow => node => {
            return 'failed';
            // let result;
            // try {
            //   result = byPath(props, node.path.slice(0, 1))(workflow.userInput);
            // } catch (error) {
            //   return advanceFlow({workflowName: workflow.name, context: {result: error}});
            // }
            // if (isObservable(result)) {
            //   return concat(
            //     of(advanceFlow({workflowName: workflow.name})),
            //     result.pipe(
            //       reduce((acc, result) => [...acc, result], []),
            //       map(result => advanceFlow({workflowName: workflow.name, context: {result}})),
            //     ),
            //   );
            // }
            // if (isPromise(result)) {
            //   return concat(
            //     of(advanceFlow({workflowName: workflow.name, context: {result}})),
            //     from(result).pipe(
            //       map(result => advanceFlow({workflowName: workflow.name, context: {result}})),
            //     ),
            //   );
            // } else {
            //   return advanceFlow({workflowName: workflow.name, context: {result}});
            // }
          },
        },
      ],
      default_flow_name: 'succeed',
      extends_flows: [
        'start_download',
        'resume_download',
        'paused_download',
        'completed_download',
        'remove_file',
        'start_upload',
        'resume_upload',
        'pause_upload',
        {
          name: 'download',
          graph: [
            'start_download:resume_download:paused_download,completed_download',
            'paused_download:resume_download',
            'start_download,resume_download,paused_download,completed_download:remove_file:start_download',
          ],
          default_flow_name: 'complete_download',
        },
        {
          name: 'upload',
          graph: [
            'start_upload:resume_upload:pause_upload:resume_upload',
            'start_upload,resume_upload,pause_upload:remove_file',
          ],
          default_flow_name: 'resume_upload',
        },
      ],
    },
    {
      name: 'upload_after_download',
      graph: 'download:upload',
    },
    {
      name: 'download_and_upload_concurrently',
      graph: 'download/resume_download:upload',
    },
  ],
});
