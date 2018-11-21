import {
    convertArrayToGraph,
    isFlowNameWithStatus,
    isExistInFlowsNamesList
} from '../../../src/parser';

const succeed = '_succeed';
const isPostfixSuccess = word => word.slice(word.length - succeed.length) === succeed;
const sliceSucceed = word => isPostfixSuccess(word) ?
    word.slice(0, word.length - succeed.length) :
    word;
const addPostfixSucceed = word => isPostfixSuccess(word) ?
    word :
    word + succeed;

const clearActiveWorkflowDetailsFromMarks = workflowDetails => {
    if (typeof workflowDetails === 'string' || workflowDetails instanceof String)
        return sliceSucceed(workflowDetails);
    if (workflowDetails !== null && typeof workflowDetails === 'object')
        return {
            workflowName: sliceSucceed(workflowDetails.workflowName),
            workflow: workflowDetails.workflow.map(sliceSucceed)
        };
    console.error('bad test parameter (workflowDetails can be string or object)', workflowDetails);
    return 'bad test';
};

function expandFlow(json, workflowName) {
    if (isFlowNameWithStatus(sliceSucceed(workflowName)))
        if (isPostfixSuccess(workflowName))
            return [{
                status: 'succeed',
                flowName: sliceSucceed(workflowName).slice(0, sliceSucceed(workflowName).length - 2),
                flowStatus: Number(sliceSucceed(workflowName).slice(sliceSucceed(workflowName).length - 1))
            }];
        else
            return [{
                flowName: workflowName.slice(0, workflowName.length - 2),
                flowStatus: Number(workflowName.slice(workflowName.length - 1))
            }];
    if (isExistInFlowsNamesList(json, sliceSucceed(workflowName)))
        if (isPostfixSuccess(workflowName))
            return [1, 2, 3].map(number => ({
                status: 'succeed',
                flowName: workflowName,
                flowStatus: number
            }));
        else
            return [1, 2, 3].map(number => ({
                flowName: workflowName,
                flowStatus: number
            }));

    const composedWorkflow = json.workflowsDetails.filter(workflowDetails =>
        workflowDetails !== null &&
        typeof workflowDetails === 'object' &&
        workflowDetails.workflowName === sliceSucceed(workflowName));

    if (composedWorkflow.length !== 1) {
        console.error('there is no composed workflow with a name: ', sliceSucceed(workflowName));
        return 'there is no composed workflow with a name: ' + sliceSucceed(workflowName);
    }

    if (isPostfixSuccess(workflowName))
        return composedWorkflow[0].workflow.map(addPostfixSucceed)
            .flatMap(workflowName => expandFlow(json, workflowName));
    return composedWorkflow[0].workflow.flatMap(workflowName => expandFlow(json, workflowName));
}

const parseWorkflowsDetails = json => {
    const clearedJsonFromMarks = {
        flowsNames: json.flowsNames,
        workflowsDetails: json.workflowsDetails.map(clearActiveWorkflowDetailsFromMarks)
    };
    return json.workflowsDetails
        .map(workflowDetails => {
            if (typeof workflowDetails === 'string' || workflowDetails instanceof String)
                if (isPostfixSuccess(workflowDetails))
                    return {
                        workflowName: sliceSucceed(workflowDetails),
                        workflow: expandFlow(clearedJsonFromMarks, addPostfixSucceed(workflowDetails))
                    };
                else
                    return {
                        workflowName: workflowDetails,
                        workflow: expandFlow(clearedJsonFromMarks, workflowDetails)
                    };
            if (workflowDetails !== null && typeof workflowDetails === 'object')
                if (isPostfixSuccess(workflowDetails.workflowName))
                    return {
                        workflowName: sliceSucceed(workflowDetails.workflowName),
                        workflow: workflowDetails.workflow.map(addPostfixSucceed)
                            .flatMap(workflowName => expandFlow(clearedJsonFromMarks, workflowName))
                    };
                else
                    return {
                        workflowName: workflowDetails.workflowName,
                        workflow: workflowDetails.workflow.flatMap(workflowName => expandFlow(clearedJsonFromMarks, workflowName))
                    };

            console.error('illegal workflow:', workflowDetails);
            return 'illegal workflow: ' + workflowDetails;
        })
        .map(workflowDetails => ({
            workflowName: workflowDetails.workflowName,
            graph: convertArrayToGraph(workflowDetails.workflow)
        }));
};

const readWorkflowsFile = json => ({
    flowsNames: json.flowsNames,
    workflowsDetails: parseWorkflowsDetails(json)
});

export default readWorkflowsFile;