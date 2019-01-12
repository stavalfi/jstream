import {compose} from 'redux';
import {identifierToString, kindof} from 'utils';

const destructString = (identifier, {expectedToFind = false, expectedFlowName, expectedStateName, flows, throwError: throwIfErrors = true}) => {
    const str = identifierToString(identifier);
    const shouldFind = () => expectedToFind && (expectedFlowName || expectedStateName || flows);
    const index = str.lastIndexOf(`_`);
    const {found, stateName, flowName} = {
        found: index > -1,
        stateName: str.slice(index + 1),
        flowName: str.slice(0, index),
    };

    if (throwIfErrors) {
        if (shouldFind() && !found)
            throw new Error(`expected to find flowName and stateName inside the string: ${str} but didn't found any.`);
        if (found && expectedFlowName && expectedFlowName !== flowName)
            throw new Error(`expected to find flowName: ${flowName} inside the string: ${str}.`);
        if (found && expectedStateName && expectedStateName !== stateName)
            throw new Error(`expected to find stateName: ${stateName} inside the string: ${str}.`);
        if (found && flows && flows.every(flow => flow.name !== flowName))
            throw new Error(`expected to find any flowName inside the string: ${str}. but didn't found any.`);
    }

    return {found, stateName, flowName};
};

const minimizeArray = subGraph => (function minimize(node) {
    switch (kindof(node)) {
        case 'string':
            return node;
        case 'array': {
            if (node.length === 0)
                throw new Error(`found empty array inside subGraph: ${subGraph}.`);
            if (node.length > 1)
                return node;
            switch (kindof(node[0])) {
                case 'string':
                    return node;
                case 'array':
                    return minimize(node[0]);
                case 'map':
                    return node;
            }
            throw new Error(`illegal type of ${node}.`);
        }
        case 'map':
            return node;
    }
    throw new Error(`illegal type of ${subGraph}.`);
})(subGraph);

const getHeadAsString = subGraph => (function findHead(node) {
    switch (kindof(node)) {
        case 'string':
            return node;
        case 'array':
            if (node.length === 0)
                throw new Error(`found empty array inside subGraph: ${subGraph}.`);
            return findHead(node[0]);
        case 'map':
            const keys = Array.from(node.keys());
            if (keys.length === 0)
                throw new Error(`found empty object inside subGraph: ${subGraph}.`);
            return findHead(keys[0]);
    }
    throw new Error(`illegal type of ${node}.`);
})(subGraph);

const ensureNoDuplications = node => {
    // todo: check equality by value and not by ref between keys of the same
    //  object and also between values of the same array.
    switch (kindof(node)) {
        case 'string':
            return node;
        case 'array': {
            const nodeHeads = node.map(getHeadAsString);
            if ((new Set(nodeHeads)).size !== nodeHeads.length)
                throw new Error(`there are duplicate elements inside ${node}`);
            return node;
        }
        case 'map': {
            const nodeHeads = Array.from(node.keys()).map(getHeadAsString);
            if ((new Set(nodeHeads)).size !== nodeHeads.length)
                throw new Error(`there are duplicate elements inside ${node}`);
            return node;
        }
    }
    throw new Error(`illegal type of ${node} in ensureNoDuplications`);
};

const expendStatelessFlows = defaultTransition => {
    const expendStatelessFlow = flowName => {
        if (defaultTransition.length === 1)
            return `${flowName}_${defaultTransition[0]}`;

        function build(i) {
            if (i === defaultTransition.length - 1)
                return `${flowName}_${defaultTransition[defaultTransition.length - 1]}`;
            return new Map([[`${flowName}_${defaultTransition[i]}`, build(i + 1)]]);
        }

        return build(0);
    };
    return workflow => (function expand(node) {
        switch (kindof(node)) {
            case 'string':
                const {found} = destructString({node}, {expectedToFind: false});
                return found ? node : expendStatelessFlow(node);
            case 'array':
                return node.map(expand);
            case 'map':
                return new Map(Array.from(node.keys())
                    .map(key => [expand(key), expand(node.get(key))]));
        }
        throw new Error(`illegal type of ${node}.`);
    })(workflow);
};

function minimizeGraph(node) {
    switch (kindof(node)) {
        case 'string':
            return node;
        case 'array':
            return minimizeArray(node)
                .map(minimizeGraph);
        case 'map':
            return new Map(Array.from(node.keys())
                .map(key => [minimizeGraph(key), minimizeGraph(node.get(key))]));
    }
    throw new Error(`illegal type of ${node}.`);
}

function isLeaf(flowStateMachine, stateName) {
    function find(node) {
        switch (kindof(node)) {
            case 'string':
                return node === stateName;
            case 'array':
                return node.some(element => (kindof(element) === 'string' && element === stateName) || find(element));
            case 'object':
                return Object.values(node)
                    .some(value =>
                        (kindof(value) === 'string' && value === stateName) || find(value));
        }
        throw new Error(`illegal type of node: ${node} as stateNode.`);
    }

    return find(flowStateMachine);
}

// use this function when you want to get all heads of a specific node.
// if it's a map, then each key in the map can contain array such that each element of that array is also head.
function findAllHeadsIdentifiersOf(node) {
    switch (kindof(node)) {
        case 'array':
            return node.flatMap((element, index) => {
                switch (kindof(element)) {
                    case 'string':
                        return [{node, key: index}];
                    case 'array':
                        return findAllHeadsIdentifiersOf(element);
                    case 'map':
                        return findAllHeadsIdentifiersOf(element);
                }
            });
        case 'map':
            return Array.from(node.keys()).flatMap(key => {
                switch (kindof(key)) {
                    case 'string':
                        return [{node, key, isKey: true}];
                    case 'array':
                        return findAllHeadsIdentifiersOf(key);
                    case 'map':
                        return findAllHeadsIdentifiersOf(key);
                }
            });
    }
}

function getFlowParent(defaultTransition, head, {node}) {
    const firstStateNameInFlow = defaultTransition[0];

    function find(pos) {
        switch (kindof(pos)) {
            case 'string':
                // the workflow and the flowStateGraph contains a single string. there are is parent.
                return {};
            case 'array':
                for (const index in pos)
                    if (pos[index] === node) {
                        const {stateName: posStateName} = destructString({
                            node: pos,
                            key: index
                        }, {expectedToFind: true});
                        if (posStateName === firstStateNameInFlow)
                            return {foundFlowParent: true, foundNode: true, flowParentNode: pos, flowParentKey: index};
                        return {foundNode: true};
                    }
                for (const index in pos) {
                    const {foundFlowParent, foundNode, flowParentNode, flowParentKey, flowParentIsKey} = find(pos[index]);
                    if (foundFlowParent)
                        return {foundFlowParent, foundNode, flowParentNode, flowParentKey, flowParentIsKey};
                    if (foundNode) {
                        const {stateName: posStateName} = destructString({
                            node: pos,
                            key: index
                        }, {expectedToFind: true});
                        if (posStateName === firstStateNameInFlow)
                            return {foundFlowParent: true, foundNode: true, flowParentNode: pos, flowParentKey: index};
                        return {foundNode};
                    }
                }
                return {};
            case 'map':
                for (const [key, value] of pos) {
                    if (key === node) {
                        const {stateName: posStateName} = destructString({
                            node: pos,
                            key,
                            isKey: true
                        }, {expectedToFind: true});
                        if (posStateName === firstStateNameInFlow)
                            return {
                                foundFlowParent: true,
                                foundNode: true,
                                flowParentNode: pos,
                                flowParentKey: key,
                                flowParentIsKey: true
                            };
                        return {foundNode: true};
                    }
                    if (value === node) {
                        const {stateName: posStateName} = destructString({
                            node: pos,
                            key,
                            isKey: false
                        }, {expectedToFind: true});
                        if (posStateName === firstStateNameInFlow)
                            return {
                                foundFlowParent: true,
                                foundNode: true,
                                flowParentNode: pos,
                                flowParentKey: key,
                                flowParentIsKey: false
                            };
                        return {foundNode: true};
                    }
                }
                for (const [key, value] of pos) {
                    {
                        const {foundFlowParent, foundNode, flowParentNode, flowParentKey, flowParentIsKey} = find(key);
                        if (foundFlowParent)
                            return {foundFlowParent, foundNode, flowParentNode, flowParentKey, flowParentIsKey};
                        if (foundNode) {
                            const {stateName: posStateName} = destructString({
                                node: pos,
                                key,
                                isKey: true
                            }, {expectedToFind: true});
                            if (posStateName === firstStateNameInFlow)
                                return {
                                    foundFlowParent: true,
                                    foundNode: true,
                                    flowParentNode: pos,
                                    flowParentKey: key,
                                    flowParentIsKey: true
                                };
                            return {foundNode};
                        }
                    }
                    {
                        const {foundFlowParent, foundNode, flowParentNode, flowParentKey, flowParentIsKey} = find(value);
                        if (foundFlowParent)
                            return {foundFlowParent, foundNode, flowParentNode, flowParentKey, flowParentIsKey};
                        if (foundNode) {
                            const {stateName: posStateName} = destructString({
                                node: pos,
                                key,
                                isKey: false
                            }, {expectedToFind: true});
                            if (posStateName === firstStateNameInFlow)
                                return {
                                    foundFlowParent: true,
                                    foundNode: true,
                                    flowParentNode: pos,
                                    flowParentKey: key,
                                    flowParentIsKey: false
                                };
                            return {foundNode};
                        }
                    }
                }
                return {};
        }
    }

    const {flowParentNode, flowParentKey, flowParentIsKey} = find(head);
    return {node: flowParentNode, key: flowParentKey, isKey: flowParentIsKey}
}

function findChildrenIdentifiersByParent(defaultTransition, head, {node, key, isKey}) {
    switch (kindof(node)) {
        case 'string':
            return [{node, key, isKey}];
        case 'array': {
            const {node: parent, key: keyParent, isKey: isKeyParent} = getFlowParent(defaultTransition, head, {
                node,
                key,
                isKey
            });
            // parent can be only an object or nothing.
            if (!parent)
                return [];

            if (isKeyParent) {
                // return all heads from parent.get(keyParent).
                switch (kindof(parent.get(keyParent))) {
                    case 'string':
                        return [{node: parent, key: keyParent, isKey: false}];
                    case 'array':
                        return findAllHeadsIdentifiersOf(parent.get(keyParent)[0]);
                    case 'map':
                        return findAllHeadsIdentifiersOf(parent.get(keyParent));
                }
            }

            if (key < node.length - 1) {
                // return all heads from the next cell of the given array.
                switch (kindof(node[key + 1])) {
                    case 'string':
                        return [{node, key: key + 1}];
                    case 'array':
                        return findAllHeadsIdentifiersOf(node[key + 1]);
                    case 'map':
                        return findAllHeadsIdentifiersOf(node[key + 1]);
                }
            }

            // I'm inside the last cell of array of an object's value. I need to find this cell's children.
            return findChildrenIdentifiersByParent(defaultTransition, head, {
                node: parent,
                key: keyParent,
                isKey: isKeyParent
            });
        }
        case 'map': {
            const {node: parent, key: keyParent, isKey: isKeyParent} = getFlowParent(defaultTransition, head, {
                node,
                key,
                isKey
            });
            if (!parent)
                return [];
            switch (kindof(parent)) {
                case 'array':
                    // I must know if this array is inside a key or a value of a map to decide which children to return.
                    return findChildrenIdentifiersByParent(defaultTransition, head, {
                        node: parent,
                        key: keyParent,
                        isKey: isKeyParent
                    });
                case 'map':
                    if (isKeyParent)
                        return findAllHeadsIdentifiersOf(parent.get(keyParent));
                    // im looking for children of a leaf that is, recursively, inside a map's value.
                    // `parent` is that map and parent.get(keyParent) is that value.
                    return findChildrenIdentifiersByParent(defaultTransition, head, {
                        node: parent,
                        key: keyParent,
                        isKey: isKeyParent
                    });
            }
        }
    }
}

const findChildrenIdentifiers = (flowStateMachine, defaultTransition, head, {node, key, isKey}) => {
    const {stateName: nodeStateName} = destructString({node, key, isKey}, {expectedToFind: true});
    switch (kindof(node)) {
        case 'array': {
            if (isLeaf(flowStateMachine, nodeStateName) && nodeStateName !== defaultTransition[defaultTransition.length - 1]) {
                // we search for children of leaf only if the leaf is the leaf of defaultTransition.
                return [];
            }
            return findChildrenIdentifiersByParent(defaultTransition, head, {node, key, isKey});
        }
        case 'map': {
            if (isKey)
                if (kindof(node.get(key)) === 'string')
                    return [{node, key, isKey: false}];
                else
                    return findAllHeadsIdentifiersOf(node.get(key));

            // node[key] is a string and we should search his children.
            // we should look for his children only if it's the leaf inside defaultTransition.
            if (nodeStateName !== defaultTransition[defaultTransition.length - 1])
                return [];

            return findChildrenIdentifiersByParent(defaultTransition, head, {node, key, isKey});
        }
    }
};

function findChildrenOfState(flowStateMachine, stateName) {
    function find(node) {
        switch (kindof(node)) {
            case 'string':
                return [];
            case 'array':
                return [];
            case 'object':
                if (node.hasOwnProperty(stateName)) {
                    switch (kindof(node[stateName])) {
                        case 'string':
                            return [node[stateName]];
                        case 'array':
                            return node[stateName];
                        case 'object':
                            return Object.keys(node[stateName]);
                    }
                }
                return Object.values(node).flatMap(find);
        }
    }

    return find(flowStateMachine);
}

const buildArrayFromGraph = (flowStateMachine, defaultTransition) => head => {
    const nodesByIdentifiers = (() => {
        const nodesAndIdentifiers = [];
        const isEqual = (identifier1, identifier2) => identifier1.node === identifier2.node &&
            identifier1.key === identifier2.key &&
            identifier1.isKey === identifier2.isKey;

        return {
            get: identifier => {
                const result = nodesAndIdentifiers.find(data => isEqual(identifier, data.identifier));
                return result && result.node;
            },
            set: (identifier, node) => {
                const result = nodesAndIdentifiers.find(data => isEqual(identifier, data.identifier));
                if (result)
                    throw new Error(`identifier: ${identifier} does exist and it points to node: ${node}.`);
                nodesAndIdentifiers.push({identifier, node});
            },
            nodes: () => nodesAndIdentifiers.map(data => data.node),
            identifiers: () => nodesAndIdentifiers.map(data => data.identifier)
        }
    })();

    const headIdentifier = getHeadIdentifier(head);

    function fillChildren(nodeIdentifier, parentIdentifier) {
        const {flowName, stateName} = destructString(nodeIdentifier, {expectedToFind: true});

        if (!nodesByIdentifiers.get(nodeIdentifier)) {
            const nodeChildrenIdentifiers = findChildrenIdentifiers(flowStateMachine, defaultTransition, head, nodeIdentifier);
            nodesByIdentifiers.set(nodeIdentifier, {
                flowName,
                stateName,
                children: nodeChildrenIdentifiers.map(identifier => identifier),
                parents: parentIdentifier ? [parentIdentifier] : [],
            });
            nodeChildrenIdentifiers.forEach(childIdentifier => fillChildren(childIdentifier, nodeIdentifier));
        } else
            nodesByIdentifiers.get(nodeIdentifier).parents.push(parentIdentifier);
    }

    function fillMissingChildrenOfNode(parentIdentifier) {
        const {flowName, stateName} = destructString(parentIdentifier, {expectedToFind: true});
        const expectedChildrenStateNames = findChildrenOfState(flowStateMachine, stateName);
        const actualChildrenIdentifiersOfNode = nodesByIdentifiers.get(parentIdentifier).children;
        const actualChildrenStateNamesOfNode = actualChildrenIdentifiersOfNode.map(nodesByIdentifiers.get)
            .map(node => node.stateName);
        expectedChildrenStateNames.filter(expectedStateName =>
            actualChildrenStateNamesOfNode.every(actualStateName => actualStateName !== expectedStateName))
            .map(missingStateName => ({
                identifier: {
                    // i must prevent multiple equal identifiers so I use arrays and not strings.
                    node: [`${flowName}_${missingStateName}`],
                    key: 0,
                },
                node: {
                    flowName,
                    stateName: missingStateName,
                    children: [],
                    parents: [parentIdentifier]
                }
            }))
            .forEach(({identifier: childIdentifier, node}) => {
                nodesByIdentifiers.set(childIdentifier, node);
                nodesByIdentifiers.get(parentIdentifier).children.push(childIdentifier);
            });
    }

    fillChildren(headIdentifier);

    nodesByIdentifiers.identifiers().forEach(fillMissingChildrenOfNode);

    nodesByIdentifiers.nodes()
        .forEach((node, index) => node.index = index);

    return nodesByIdentifiers.nodes()
        .map(node => ({
            flowName: node.flowName,
            stateName: node.stateName,
            children: node.children.map(childIdentifier => nodesByIdentifiers.get(childIdentifier).index),
            parents: node.parents.map(parentIdentifier => nodesByIdentifiers.get(parentIdentifier).index),
        }));
};

function getHeadIdentifier(node) {
    switch (kindof(node)) {
        case 'string':
            // we can be here if flow is a single string after expend.
            return {node};
        case 'array':
            if (kindof(node[0]) === 'string')
                return {node, key: 0};
            else
                return getHeadIdentifier(node[0]);
        case 'map':
            const keys = Array.from(node.keys());
            if (keys.length !== 1 || kindof(keys[0]) === 'array')
                throw new Error(`illegal node: ${node} in head in workflow: ${head}.`);
            if (kindof(keys[0]) === 'string')
                return {node, key: keys[0], isKey: true};
            return getHeadIdentifier(keys[0])
    }
}

const ensureNoObjectsAsKeys = head => (function ensure(node) {
    switch (kindof(node)) {
        case 'string':
            return node;
        case 'array':
            return node.map(ensureNoObjectsAsKeys);
        case 'map':
            return new Map(Array.from(node.keys())
                .map(key => {
                    if (key === 'object object')
                        throw new Error(`you forgot to stringify a key that is an object in workflow: ${head}.`);
                    return [ensureNoObjectsAsKeys(key), ensureNoObjectsAsKeys(node.get(key))]

                }));
    }
})(head);

function convertToMaps(node) {
    switch (kindof(node)) {
        case 'string':
            try {
                const object = JSON.parse(node);
                return convertToMaps(object);
            } catch {
                return node;
            }
        case 'array':
            return node.map(convertToMaps);
        case 'object':
            return new Map(Object.keys(node)
                .map(key => {
                    const convertedKey = convertToMaps(key);
                    const convertedValue = convertToMaps(node[key]);
                    return [convertedKey, convertedValue];
                }));
    }
    throw new Error(`unexpected input as node: ${node}`);
}

export default ({flowStateMachine, defaultTransition, workflows, flows}) => {
    const parse = compose(
        buildArrayFromGraph(flowStateMachine, defaultTransition),
        // todo: ensure head has a single element.
        ensureNoDuplications,
        // todo: check that all objects doesn't contain multiple keys such that each key is the start of a different flow.
        minimizeGraph,
        expendStatelessFlows(defaultTransition),
        ensureNoObjectsAsKeys,
        convertToMaps,
    );
    const map = workflows.map(workflow => {
        switch (kindof(workflow)) {
            case 'string':
                return workflow;
            case 'object':
                return workflow.workflow
        }
        throw new Error(`unexpected input as workflow: ${workflow}`);
    }).map(parse);
    return map;
};