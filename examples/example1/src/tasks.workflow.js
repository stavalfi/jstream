import isPromise from 'is-promise';
import byPath from 'object-path';
import {concat, from, isObservable, of} from 'rxjs';
import {map, reduce} from 'rxjs/operators';

export const createWorkflowConfig = props => ({
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
      rules: [
        {
          edge: 'should_start:failed',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'should_start:cancelling',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'should_start:succeed',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'cancelling:canceled',
          predicate: workflow => console.log(workflow),
        },
      ],
    },
    {
      name: 'flow',
      graph: 'should_start:failed,canceled,succeed,[waiting:failed,canceled,succeed]',
      side_effects: [
        {
          node: 'should_start',
          side_effect: (workflow, node) => {
            let result;
            try {
              result = byPath(props, node.path.slice(0, 1))(workflow.user_input);
            } catch (error) {
              return of({
                graph: "flow",
                result: error,
                next: 'failed',
              });
            }
            if (isObservable(result)) {
              return concat(
                of({
                  graph: "workflow",
                  next: 'waiting',
                }),
                result.pipe(
                  reduce((acc, result) => [...acc, result], []),
                  map(result => ({
                    result,
                    next: 'succeed',
                  })),
                ),
              );
            }
            if (isPromise(result)) {
              return concat(
                of({
                  next: 'waiting',
                }),
                from(result).pipe(
                  map(result => ({
                    result,
                    next: 'succeed',
                  })),
                ),
              );
            } else {
              return {
                result,
                next: 'succeed',
              };
            }
          },
        },
      ],
      rules: [
        {
          edge: 'should_star:failed',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'should_star:canceled',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'should_star:succeed',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'should_star:waiting',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'waiting:failed',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'waiting:canceled',
          predicate: workflow => console.log(workflow),
        },
        {
          edge: 'waiting:succeed',
          predicate: workflow => console.log(workflow),
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
  ],
  default_workflow_state_machine: 'default_workflow_state_machine',
  workflows: [
    'download',
    'upload',
    {
      name: 'upload_after_download',
      graph: ['download:upload'],
    },
    {
      name: 'download_and_upload_concurrently',
      graph: ['download/resume_download/succeed:upload'],
    },
  ],
});
