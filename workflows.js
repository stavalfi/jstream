module.exports = {
    flowsNames: [
        "a",
        "b",
        "c"
    ],
    workflowsDetails: [
        // version 1:
        "a",
        "c",
        // version 2:
        {
            workflowName: "a",
            workflow: ["a"]
        },
        {
            workflowName: "delete",
            workflow: ["a1", "b", "c", "a2", "a3"]
        },
        {
            workflowName: "add",
            // TODO: be able to declare sub-workflowsDetails that will be used inside this workflow ONLY.
            workflow: [
                "delete",
                ["a", "b"],
                "c"
            ]
        },
        // version 3:
        {
            workflowName: "modify",
            predicate: activeFlows => 1 + 1,
            workflow: [
                "a1",
                {
                    action: "b",
                    predicate: flow => false,
                },
                "c",
                {
                    action: "a2",
                    predicate: flow => false,
                },
                "a3"
            ]
        }
    ]
};
/*
// how to use:

const flowIdentifier1 = executeFlow("a");
// flowIdentifier1 = { id: 03k3u3hf73thh }
const flowIdentifier2 = executeFlow(flowsNames.a);
// flowIdentifier1 = { id: xdwd23dwqd23d }
const flowIdentifier3 = executeFlow(flowsNames.a, {customData1: 1, customData2: "my data!"});
// flowIdentifier1 = { id: 3uhfd3yhf83fh, customData: {customData1: 1, customData2: "my data!"}}
// or: (not sure yet)
// flowIdentifier1 = { id: 3uhfd3yhf83fh, customData1: 1, customData2: "my data!"}

const flowIdentifier4 = executeFlow(flowsNames.add);


selfResolved(flowIdentifier4,"a");
selfResolved(flowIdentifier4,flowsNames.c);
selfResolved(flowIdentifier4,flowsNames.a);
*/