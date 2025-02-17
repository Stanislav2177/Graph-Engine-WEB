// graph.js
import {
    stateFetchData,
    stateAddEdges,
    stateRemoveNodes,
    stateRemoveEdges,
    stateFindShortestPath,
    isActionActivated,
    lastPressedNode,
    setCy,
} from "./state.js";
import { changeStatus, addTextToStatus } from "./utils.js";
import {
    currentButton,
    buttonDeleteNodes,
    buttonDeleteEdges,
    buttonFindShortestPath,
    buttonAddEdge
} from "./ui.js";

export var cyInit = "";
export function loadDataToGraph(dataJson) {
    const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: {
            nodes: dataJson.elements.nodes.map((node) => ({
                data: { id: node.id, label: node.label },
            })),
            edges: dataJson.elements.edges.map((edge) => ({
                data: {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    weight: edge.weight,
                    directed: true
                },
            })),
        },
        style: [
            {
                selector: "node",
                style: {
                    "background-color": "#0074D9",
                    label: "data(label)",
                    color: "#fff",
                    "text-valign": "center",
                    "text-outline-width": 1,
                    "text-outline-color": "#000",
                    width: 40, // Fixed width
                    height: 40, // Fixed height
                },
            },
            {
                selector: "edge",
                style: {
                    width: 2,
                    "line-color": "#696973",
                    "target-arrow-color": "#FF4136",
                    "target-arrow-shape": "triangle",
                    "curve-style": "bezier",
                    label: "data(weight)",
                    "arrow-scale": 1.5, // Make arrows more visible
                },
            },
        ],
        layout: {
            name: "grid",
            rows: 3,
        },
    });

    // Click on Node
    cy.on("click", "node", function (event) {
        const node = event.target;
        lastPressedNode.push(node.id());

        console.log("currentbtn:", currentButton);

        switch (currentButton) {
            case buttonFindShortestPath:
                if (stateFindShortestPath.source == "") {
                    stateFindShortestPath.source = node.id();
                    addTextToStatus("Source: " + stateFindShortestPath.source);
                    console.log("source:", stateFindShortestPath.source);
                } else {
                    stateFindShortestPath.target = node.id();
                    addTextToStatus("Target: " + stateFindShortestPath.target);
                    console.log("target:", stateFindShortestPath.target);
                }

                if (stateFindShortestPath.source != "" && stateFindShortestPath.target != "") {
                    stateFindShortestPath.isFindShortestPathActive = false;
                }
                break;

            case buttonDeleteNodes:
                const selectedElements = cy.$(":selected");
                console.log("delete nodes: ", selectedElements);

                stateRemoveNodes.removedElementsStack.push(selectedElements.toArray()); // Convert to a plain array
                console.log(stateRemoveNodes.removedElementsStack);
                break;

            case buttonAddEdge:
                stateAddEdges.currentClickedNode = node.id();
                stateAddEdges.allClickedNodes.push(stateAddEdges.currentClickedNode);
                if (stateAddEdges.allClickedNodes.length == 1) {
                    addTextToStatus("Source add edge: " + stateAddEdges.currentClickedNode);
                } else {
                    addTextToStatus("Target add edge: " + stateAddEdges.currentClickedNode);
                }
                console.log(stateAddEdges.allClickedNodes);
                break;
            default:
                console.log("Clicked node: ", node.id());
        }
    });

    // Click on Edge
    cy.on("tap", "edge", function (event) {
        const edge = event.target;
        const edgeData = edge.data();
        if (currentButton === buttonDeleteEdges) {
            stateRemoveEdges.allEdgeData.push(edgeData);
            edge.remove();
            console.log("test");
        } else {
            changeStatus(`Source: ${edgeData.source}; Target: ${edgeData.target}; Weight: ${edgeData.weight}`);
        }
    });

    cy.on("remove", function (event) {
        stateRemoveNodes.deletedElementsStack.push(event.target);
        stateRemoveNodes.removedElementsStack.push(lastPressedNode.pop());
    });

    setCy(cy);
    cyInit = cy;
}

export function findShortestPath(sourceId, targetId) {
    // Ensure previous path is cleared before finding a new one
    //clearShortestPath();

    const dijkstra = cyInit.elements().dijkstra(`#${sourceId}`, (edge) => edge.data("weight"), true); // true = directed
    const path = dijkstra.pathTo(cyInit.$(`#${targetId}`));

    if (!path || path.length === 0) {
        console.log("No path found.");
        return;
    }

    path.addClass("highlighted"); // Add class to nodes & edges in the path

    console.log("Shortest path:", path.map((ele) => ele.id()));

    cyInit.style()
        .selector('edge.highlighted') // Apply only to edges with the 'highlighted' class
        .style({
            'line-color': 'red',          // Edge color
            'width': 4,                   // Edge thickness
            'target-arrow-color': 'red',  // Arrow color for directed edges
            'target-arrow-shape': 'triangle', // Arrow shape
            'curve-style': 'bezier',      // Smooth edges
        })
        .update();


}

//        cyInit.elements('.highlighted').removeClass('highlighted'); // Remove highlight class from all elements


