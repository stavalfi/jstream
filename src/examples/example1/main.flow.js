import isPromise from 'is-promise';
import byPath from 'object-path';
import {concat, from, isObservable, of} from 'rxjs';
import {map, reduce} from 'rxjs/operators';
import {advanceFlow} from '../../redux-extension/actions';

export default {
  splitters: {
    extends: '/',
  },
  flows: [
    {
      name: 'state',
      graph: 'should_start:failed,canceled,succeed,[waiting:failed,canceled,succeed]',
      default_flow_name: 'succeed',
      side_effects: [
        {
          node_name: 'should_start',
          side_effect: workflow => node => {
            console.log('something is working');
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
      extends_flows: [
        {
          name: 'download',
          graph: [
            'start_download:resume_download:paused_download,completed_download',
            'paused_download:resume_download',
            'start_download,resume_download,paused_download,completed_download:remove_file:start_download',
          ],
          default_flow_name: 'completed_download',
        },
        {
          name: 'upload',
          graph: [
            'start_upload:resume_upload:pause_upload:resume_upload',
            'start_upload,resume_upload,pause_upload:remove_file',
          ],
          default_flow_name: 'resume_upload',
        },
        {
          name: 'upload_after_download',
          graph: 'download',
        },
        {
          name: 'download_and_upload_concurrently',
          graph: 'download/resume_download:upload',
        },
      ],
    },
  ],
};
