export default () => ({
  splitters: {
    extends: '/',
  },
  flows: [
    {
      name: 'state',
      graph: 'should_start:failed,canceled,succeed,[waiting:failed,canceled,succeed]',
      default_flow_name: 'succeed',
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
});
