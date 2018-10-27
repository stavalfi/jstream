module.exports = {
    actions: [
        "a",
        "b",
        "c"
    ],
    flows: [
        // version 1:
        "a",
        "c",
        // version 2:
        {
            flowName: "a",
            flow: ["a"]
        },
        {
            flowName: "delete",
            flow: ["a1", "b", "c", "a2", "a3"]
        },
        {
            flowName: "add",
            flow: [
                "delete",
                ["a", "b"],
                "c"
            ]
        },
        // version 3:
        {
            flowName: "add",
            predicate: activeFlows => true,
            flow: [
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

const flowIdentifier1 = executeFlow("a");
// flowIdentifier1 = { id: 03k3u3hf73thh }
const flowIdentifier2 = executeFlow(actions.a);
// flowIdentifier1 = { id: xdwd23dwqd23d }
const flowIdentifier3 = executeFlow(actions.a, {customData1: 1, customData2: "my data!"});
// flowIdentifier1 = { id: 3uhfd3yhf83fh, customData: {customData1: 1, customData2: "my data!"}}
// or: (not sure yet)
// flowIdentifier1 = { id: 3uhfd3yhf83fh, customData1: 1, customData2: "my data!"}

const flowIdentifier4 = executeFlow(actions.add);


selfResolved(flowIdentifier4,"a");
selfResolved(flowIdentifier4,actions.c);
selfResolved(flowIdentifier4,actions.a);
