// import byPath from 'object-path';
// import {concat, from, isObservable, of} from 'rxjs';
// import {map,reduce} from 'rxjs/operators';
// import isPromise from 'is-promise';
//
// export const defaultWorkflowsLogic = {
//   changes: [
//     {
//       label: 'canceling workflow',
//       type: 'workflow-graph-change',
//       logic: workflow => {
//         if (activeNodes(graph(workflow)).length === 0) {
//           const isWorkflowCancelling = activeNodes(stateMachine(workflow)).some(node =>
//             nodeName(node).includes('/cancelling'),
//           );
//           if (isWorkflowCancelling)
//             return {
//               type: 'workflow-graph-change',
//               next: '/canceled',
//             };
//         }
//         return {};
//       },
//     },
//     {
//       label: 'failing workflow',
//       type: 'workflow-graph-change',
//       logic: workflow =>
//         state(workflow).didAnyFlowFailed
//           ? {
//               type: 'workflow-graph-change',
//               next: '/failed',
//             }
//           : {},
//     },
//     {
//       label: 'succeed workflow',
//       type: 'workflow-graph-change',
//       logic: workflow => {
//         if (activeNodes(graph(workflow)).length === 0) {
//           const isWorkflowStarted = activeNodes(stateMachine(workflow)).some(node =>
//             nodeName(node).includes('/should_start'),
//           );
//           if (isWorkflowStarted)
//             return {
//               type: 'workflow-graph-change',
//               next: '/succeed',
//             };
//         }
//         return {};
//       },
//     },
//   ],
//   onUserChange: workflow => userParams => {
//     if (userParams.cancelling) {
//       return [
//         {
//           type: 'workflow-graph-change',
//           next: '/canceling',
//         },
//         ...activeNodes(graph(workflow)).map(node => ({
//           type: 'workflow-stateMachine-change',
//           node,
//           next: '/canceled',
//         })),
//       ];
//     }
//   },
// };
// export const shouldStartLogic = props => workflow => (lastResult, nodePath) => {
//   let result;
//   try {
//     result = byPath(props.userLogic, nodePath.slice(0, nodePath.length - 1))(workflow, lastResult);
//   } catch (error) {
//     return of({
//       result: error,
//       next: '/failed',
//     });
//   }
//   if (isObservable(result)) {
//     return concat(
//       of({
//         next: '/waiting',
//       }),
//       result.pipe(
//         reduce((acc, result) => [...acc, result], []),
//         map(result => ({
//           result,
//           next: '/succeed',
//         })),
//       ),
//     );
//   }
//   if (isPromise(result)) {
//     return concat(
//       of({
//         next: '/waiting',
//       }),
//       from(result).pipe(
//         map(result => ({
//           result,
//           next: '/succeed',
//         })),
//       ),
//     );
//   } else {
//     return {
//       result,
//       next: '/succeed',
//     };
//   }
// };
