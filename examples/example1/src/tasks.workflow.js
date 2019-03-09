import {defaultWorkflowsLogic, shouldStartLogic} from './tasks-logic.workflow';

export const createWorkflowConfig = props => ({
  splitters: {
    extends: '/',
  },
  flows: [
    {
      name: 'should_start',
      logic: shouldStartLogic(props),
    },
    'waiting',
    'failed',
    'cancelling',
    'canceled',
    'succeed',
    {
      graph: ['should_start:waiting,failed,canceled,succeed', 'waiting:failed,canceled,succeed'],
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
    {
      default: {
        state_machine_graph: ['should_start:failed,[cancelling:canceled],succeed'],
        logic: defaultWorkflowsLogic,
      },
    },
  ],
});
