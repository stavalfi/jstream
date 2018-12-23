import compose from 'compose-function';
// import identity from 'identity-function';
import {mapIf} from './utils';

// import kindof from 'kindof';

function kindof(obj) {
    let type
    if (obj === undefined) return "undefined"
    if (obj === null) return "null"

    switch (type = typeof obj) {
        case "object":
            switch (Object.prototype.toString.call(obj)) {
                case "[object RegExp]":
                    return "regexp"
                case "[object Date]":
                    return "date"
                case "[object Array]":
                    return "array"
            }

        default:
            return type
    }
}

// str is a string and it can represent a flow name or a flow name with a postfix of a stateName.
const findStateNameInEndOfString = (flowStateMachine, str) => {
    function find(node) {
        switch (kindof(node)) {
            case 'array':
                for (const element in node) {
                    const result = find(element);
                    if (result.found)
                        return result;
                }
                break;
            case 'string': {
                const isLeaf = (head, nodeName) => (function find(node) {
                    switch (kindof(node)) {
                        case 'array':
                            // we can be here only if the depth of the graph is 1 (possible depths: 0,1,2,...).
                            return node.some(find);
                        case "string":
                            return node === nodeName;
                        case 'object':
                            return Object.values(node).some(find);
                    }
                    throw new Error(`illegal node: ${node}`);
                })(head);
                const result = str.lastIndexOf(`_${node}`);
                return {
                    found: result > -1,
                    stateName: node,
                    flowName: str.slice(0, result),
                    isStateLeaf: isLeaf(flowStateMachine, str.slice(0, result)),
                };
            }
            case 'object': {
                for (const key in node) {
                    const resultOfKey = find(key);
                    if (resultOfKey.found)
                        return resultOfKey;
                    const resultOfValue = find(node[key]);
                    if (resultOfValue.found)
                        return resultOfValue;
                }
                break;
            }
            default:
                throw new Error(`illegal node in flowStateMachine property: ${node}`);
        }
        return {
            found: false
        };
    }

    return find(flowStateMachine);
};

const createDefaultSubGraph = (flowStateMachine, missingStateName, flowName) => {
    function copySubGraph(node) {
        switch (kindof(node)) {
            case 'array':
                return node.map(copy);
            case "string":
                return `${flowName}_${node}`;
            case 'object': {
                return Object.keys(node).reduce((obj, key) => ({
                    ...obj,
                    [[copySubGraph(key)]]: copySubGraph(node[key])
                }), {});
            }
        }
        throw new Error(`illegal node: ${node}`);
    }

    function find(node) {
        switch (kindof(node)) {
            case 'array':
                return node.flatMap(find);
            case 'object': {
                const keys = Object.keys(node);
                for (const key in keys)
                    if (typeof key === "string" && key === missingStateName)
                        return {
                            found: true,
                            key,
                            node: node[key]
                        }
            }
        }
        return {found: false};
    }

    const {found, key, node} = find(flowStateMachine);
    if (found)
        return {
            [[`${flowName}_${node}`]]: copySubGraph(node)
        };
    throw new Error(`can't find ${missingStateName} in ${flowStateMachine}.`);
};

function copyFlowStateMachineGraph(pos) {
    switch (kindof(pos)) {
        case 'array':
            return pos.map(copyFlowStateMachineGraph)
                .map(mapIf(element => typeof element === 'string', stateName => `${node}_${stateName}`));
        case 'string':
            // pos === stateName
            return `${node}_${pos}`;
        case 'object':
            return Object.keys(pos)
                .map(key => ({[copyFlowStateMachineGraph(key)]: copyFlowStateMachineGraph(pos[key])}))
                .reduce((obj, element) => ({...obj, ...element}), {});
    }
    throw new Error(`illegal node: ${pos}`);
}

const expand = (flows, flowStateMachine, priorityFlowStateMachine) => function expend(node) {
    switch (kindof(node)) {
        case 'string': {
            // we can only be here if we are inside an array or we are in an object key or we are in a leaf.
            const {found, flowName} = findStateNameInEndOfString(flowStateMachine, node);
            if (found)
                if (flows.some(flow => flow.name === flowName))
                    return node;
                else
                    throw new Error(`illegal flow name: ${flowName} in: ${node}`);
            else {
                // node === flowName
                return copyFlowStateMachineGraph(flowStateMachine);
            }
        }
        case 'array': {
            return node.map(expend);
        }
        case 'object':
            return Object.keys(node).map(key => {
                switch (kindof(key)) {
                    case 'array':
                        return {
                            [key.map(expend)]: expend(node[key])
                        };
                    case 'string': {
                        const findChildsByName = (head, nodeName) => {
                            function find(pos) {
                                switch (kindof(pos)) {
                                    case 'array':
                                        return pos.flatMap(find);
                                    case 'string': {
                                        // if nodeName===node then return [] and if not then return [].
                                        return pos === nodeName ? [pos] : [];
                                    }
                                    case 'object': {
                                        const key = Object.keys(pos).find(key => typeof key === "string" && key === nodeName);
                                        return key ? pos[key] : Object.values(pos).flatMap(find);
                                    }
                                }
                                return [];
                            }

                            return find(head);
                        };
                        const {found, flowName, stateName, isStateLeaf} = findStateNameInEndOfString(flowStateMachine, key);
                        if (found && !isStateLeaf) {
                            const stateChildsNames = findChildsByName(flowStateMachine, stateName);
                            switch (kindof(node[key])) {
                                case "object": {
                                    const childs = Object.keys(node[key]);
                                    // find all missing childs and create a child in the graph for each of them.
                                    const missingStateNames = stateChildsNames.filter(stateChild => childs.every(child => {
                                        switch (typeof child) {
                                            case "string":
                                                const {found, flowName} = findStateNameInEndOfString(flowStateMachine, child);
                                                if (found)
                                                    return stateChild !== flowName;
                                                throw new Error(`illegal node: ${child}. child does not contain stateName as a postfix.`);
                                            default:
                                                throw new Error(`illegal node: ${child}. it must be a string `);
                                        }
                                    }));
                                    return {
                                        [key]: {
                                            ...node[key],
                                            ...missingStateNames.map(missingStateName => createDefaultSubGraph(flowStateMachine, missingStateName, flowName))
                                        }
                                    };
                                }
                                case 'array': {
                                    const childs = node[key];
                                    // find all missing childs and create a child in the graph for each of them.
                                    const missingStateNames = stateChildsNames.filter(stateChild => childs.every(child => {
                                        switch (typeof child) {
                                            case "string":
                                                const {found, flowName} = findStateNameInEndOfString(flowStateMachine, child);
                                                if (found)
                                                    return stateChild !== flowName;
                                                throw new Error(`illegal node: ${child}. child does not contain stateName as a postfix.`);
                                            default:
                                                throw new Error(`illegal node: ${child}. it must be a string `);
                                        }
                                    }));
                                    return {
                                        [key]: [
                                            ...node[key],
                                            ...missingStateNames.map(missingStateName => createDefaultSubGraph(flowStateMachine, missingStateName, flowName))
                                        ]
                                    };
                                }
                                default:
                                    throw new Error(`illegal node: ${node[key]} of parent: ${key}. 
                                    if a node has no-leaf state-name then it's child must be object 
                                    such that each of it's keys are objects also such that each of 
                                    them has a key with a postfix of a state-name of the next child 
                                    according to flowStateMachine.`);
                            }
                        }
                        return {
                            [expend(key)]: expend(node[key])
                        };
                    }
                }
                throw new Error(`illegal node: ${key}`);
            }).reduce((obj, element) => ({...obj, ...element}), {});
    }
    throw new Error(`illegal string ${node} in workflow`);
};

// workflow is a fully expended graph.
const GraphToArray = (workflow, priorityFlowStateMachine) => {

};


const parseWorkflows = (workflows, flows, flowStateMachine, defaultTransition, priorityFlowStateMachine) => {
    const expandFlowFunc = expand(flows, flowStateMachine, priorityFlowStateMachine);
    return workflows.filter(workflow => workflow)
        .map(workflow => {
            switch (kindof(workflow)) {
                case 'string':
                    return {
                        name: workflow,
                        logicGraph: compose(expandFlowFunc)(workflow),
                        transition: defaultTransition
                    };
                case 'object':
                    return {
                        name: workflow.name,
                        logicGraph: compose(expandFlowFunc)(workflow.workflow),
                        transition: workflow.hasOwnProperty('transition') ? workflow.transition : defaultTransition
                    };
            }
            throw new Error('illegal workflow');
        });
};

// const workflowToGraph = workflow => workflow;
const toStatusesGraph = workflowStateMachine => workflowStateMachine;

export default ({
                    priorityFlowStateMachine,
                    defaultTransition,
                    flowStateMachine,
                    workflowStateMachine,
                    flows,
                    workflows
                }) => ({
    workflows: parseWorkflows(workflows, flows, flowStateMachine, defaultTransition, priorityFlowStateMachine),
    // workflowStatusesGraph: toStatusesGraph(workflowStateMachine)
});