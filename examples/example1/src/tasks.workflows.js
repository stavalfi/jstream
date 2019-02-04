export default {
  // it will override the defaultLeafState property the lib defined.
  defaultLeafState: 'succeed',
  flows: [
    {
      name: 'start_download',
    },
    {
      name: 'resume_download',
    },
    {
      name: 'pause_download',
    },
    {
      name: 'start_upload',
    },
    {
      name: 'resume_upload',
    },
    {
      name: 'pause_upload',
    },
    {
      name: 'remove_file',
    },
    {
      name: 'complete_download',
    },
    {
      name: 'download',
      flow: [
        "start_download:resume_download:paused_download,completed_download",
        "paused_download:resume_download",
        "start_download,resume_download,paused_download,completed_download:remove_file:start_download"
      ],
      // the real default leaf is: defaultLeafFlow_defaultLeafState
      defaultLeafFlow: 'complete_download'
    },
    {
      name: 'upload',
      flow: [
        "start_upload:resume_upload:paused_upload:resume_upload",
        "start_upload,resume_upload,paused_upload:remove_file"
      ],
      // sometimes the user won't be able to specify defaultLeafFlow. like here.
    }
  ],
  workflows: [
    'download',
    'upload',
    {
      name: 'upload_after_download',
      workflow: {
        'download': 'upload'
      }
    },
    {
      name: 'download_and_upload_concurrently',
      workflow: [
        "download-1",
        {
          "download-1": [
            "resume_download:upload"
          ]
        }
      ]
    }
  ]
};