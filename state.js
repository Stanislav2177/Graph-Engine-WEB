// state.js
export const stateFetchData = {
    elementsInit: null,
    isDataAlreadyLoaded: false,
};

export const stateAddEdges = {
    counter: 0,
    isAddEdgesBetweenNodesVisible: false,
    isAddEdgeEnabled: false,
    allClickedNodes: [],
    currentClickedNode: "",
    sourceAndConnectedEdges: [],
};

export const stateRemoveEdges = {
    isRemoveEdgesEnabled: false,
    allEdgeData: [],
    undoRemovingEdge: [],
};

export const stateFindShortestPath = {
    isFindShortestPathActive: false,
    source: "",
    target: "",
};

export const stateAddNodes = {
    counterForNewDestination: 1,
    mapWithAddedElements: new Map()
}

export const stateRemoveNodes = {
    isDeleteButtonsVisible: false,
    deletedElementsStack: [],
    removedElementsStack: [],
}

export const lastPressedNode = [];
export let isActionActivated = false;
export let cy; // Cytoscape instance

export function setCy(newCy) {
    cy = newCy;
}

export function getCy() {
    return cy;
}