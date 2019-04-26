export default () => ({
  splitters: {
    extends: '/',
  },
  flows: [
    {
      graph: 'flow0',
      extends_flows: [
        {
          name: 'flow1',
          graph: 'a:b',
          default_flow_name: 'b',
        },
        {
          name: 'flow2',
          graph: 'c:d',
          default_flow_name: 'd',
        },
        {
          name: 'composed-flow',
          graph: 'flow1:flow2',
        },
      ],
    },
  ],
});
