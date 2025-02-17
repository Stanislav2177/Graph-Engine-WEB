// ui.js
import {
    stateFetchData,
    stateAddEdges,
    stateRemoveEdges,
    stateFindShortestPath,
    stateAddNodes,
    stateRemoveNodes,
    getCy
} from "./state.js";
import { changeStatus, setTimeOutFn, addTextToStatus } from "./utils.js";
import { loadDataToGraph, findShortestPath, cyInit } from "./graph.js";
import { fetchGraph, deleteNodes, postAddNewConnections, deleteConnections, postAddNewNodes } from "./api.js";

export var currentButton = null;
export var buttonDeleteNodes = null;
export var buttonDeleteEdges = null;
export var buttonFindShortestPath = null;
export var buttonAddEdge = null;

export function initUI() {
    buttonDeleteNodes = document.getElementById("btn-deleteNodes");
    buttonDeleteEdges = document.getElementById("btn-deleteEdges");
    buttonFindShortestPath = document.getElementById("btn-findShortestPath");
    buttonAddEdge = document.getElementById("add-edge-btn");

    const buttonFetchAllConnections = document.getElementById("fetchAllConnections");
    const buttonOpenModal = document.getElementById("btn-openModalForNewNode");
    const buttonaddNewDestinationInModal = document.getElementById("btn-addNewDestinationInModal");
    const buttonSaveChangesAndApplyInNewNodeModal = document.getElementById("btn-saveChangesAndApplyInNewNodeModal");
    const buttonUndoDelete = document.getElementById("undo-button");
    const buttonDelete = document.getElementById("delete-button");
    let activeButton = null;
    const buttons = document.querySelectorAll("button");

    disableAllButtons(buttonFetchAllConnections);

    function handleButtonClick(button, callback) {
        if (activeButton && activeButton !== button) {
            return;
        }

        activeButton = button;
        disableAllButtons(button);
        button.disabled = false;

        Promise.resolve()
            .then(() => callback())
            .catch((error) => {
                console.error("Error during button operation:", error);
            })
            .finally(() => {
                // if (button.id == buttonDeleteNodes.id) {
                //     enableAllButtons();
                // }
                activeButton = null;
            });
    }

    function disableAllButtons(exceptButton) {
        buttons.forEach((button) => {
            if (button !== exceptButton) {
                button.disabled = true;
            }
        });
    }

    function enableAllButtons() {
        buttons.forEach((button) => {
            button.disabled = false;
        });
    }

    buttonFetchAllConnections.addEventListener("click", async () => {
        handleButtonClick(buttonFetchAllConnections, async () => {
            changeStatus("Fetching Data from server");
            const dataJson = await fetchGraph();
            console.log(dataJson);
            loadDataToGraph(dataJson);
            if (!dataJson) {
                changeStatus("Problem with fetching data, check internet connection !");
            } else {
                stateFetchData.elementsInit = dataJson;
                stateFetchData.isDataAlreadyLoaded = true;
                setTimeOutFn("Waiting for action...", 1000);
            }

            enableAllButtons();
        });
    });

    buttonFindShortestPath.addEventListener("click", function () {
        handleButtonClick(buttonFindShortestPath, () => {
            if (!stateFindShortestPath.isFindShortestPathActive) {
                stateFindShortestPath.isFindShortestPathActive = true;
                changeStatus("Choose Source and Target:");
                buttonFindShortestPath.textContent = "Finish";
                currentButton = buttonFindShortestPath;
                disableAllButtons(buttonFindShortestPath);
            } else {
                if (stateFindShortestPath.source == "" || stateFindShortestPath.target == "") {
                    changeStatus("Missing node");
                    stateFindShortestPath.isFindShortestPathActive = false;
                    setTimeOutFn("base", 1000);
                    this.textContent = "Find Shortest Path";
                } else {
                    console.log("finding shortest path");
                    findShortestPath(stateFindShortestPath.source, stateFindShortestPath.target);
                    stateFindShortestPath.source = "";
                    stateFindShortestPath.target = "";
                    this.textContent = "Find Shortest Path";
                    setTimeOutFn("base", 1000);

                }

                currentButton = null;
                enableAllButtons();
            }
        });
    });

    //---------------- Reset graph -------------------
    document.getElementById("resetGraph").addEventListener("click", function () {
        handleButtonClick(document.getElementById("resetGraph"), () => {
            if (stateFetchData.isDataAlreadyLoaded) {
                loadDataToGraph(stateFetchData.elementsInit);
            } else {
                changeStatus("Fetch Data first");
            }
        });
    });


    // ---------------- Add a new edge between nodes A and D ----------------
    buttonAddEdge.addEventListener("click", function () {
        handleButtonClick(buttonAddEdge, () => {

            if (stateAddEdges.isAddEdgesBetweenNodesVisible) {
                if (stateAddEdges.allClickedNodes.length == 0) {
                    changeStatus("You have not selected any nodes:");
                    setTimeOutFn("base", 3000);
                } else {
                    console.log(stateAddEdges.allClickedNodes);
                }
                var inputWeight = document.getElementById("inputAddWeightBtwEdges");

                if (inputWeight.value > 0) {
                    let firstElSource = stateAddEdges.allClickedNodes[0];
                    console.log("source:", firstElSource);
                    var tempClickedNodes = [];
                    while (stateAddEdges.allClickedNodes.length !== 1) {
                        let targetEl = stateAddEdges.allClickedNodes.pop();
                        tempClickedNodes.push(targetEl);
                        console.log("target:", targetEl);

                        //Add Edge
                        cyInit.add({
                            group: "edges",
                            data: {
                                id: `${firstElSource}${targetEl}}`,
                                source: firstElSource,
                                target: targetEl,
                                weight: inputWeight.value,
                            },
                        });
                    }
                    stateAddEdges.sourceAndConnectedEdges.push({
                        source: firstElSource,
                        weight: inputWeight.value,
                        targets: tempClickedNodes,
                    });
                    stateAddEdges.counter = stateAddEdges.counter + 1;
                    console.log(stateAddEdges.sourceAndConnectedEdges);

                    stateAddEdges.allClickedNodes = [];
                    changeStatus("base");
                    inputWeight.value = "";
                } else {
                    setTimeOutFn("Empty Weight", 1000);
                    inputWeight.value = "";
                    stateAddEdges.allClickedNodes = [];
                }

                buttonAddEdge.textContent = "Add Edge(s) between nodes";
                document.getElementById("addWeightBtwEdges").style.display = "none";
                stateAddEdges.isAddEdgesBetweenNodesVisible = false;

                enableAllButtons();
            } else {
                changeStatus("Select Source Node:");
                buttonAddEdge.textContent = "Finish";
                stateAddEdges.isAddEdgeEnabled = true;

                stateAddEdges.isAddEdgesBetweenNodesVisible = true;
                document.getElementById("addWeightBtwEdges").style.display = "block";
            }
        });
    });

    //--------- Buttons Func ----------
    // Toggle visibility on button click
    buttonDeleteNodes.addEventListener("click", function () {
        handleButtonClick(buttonDeleteNodes, () => {
            let deleteButtonsDiv = document.getElementById("deleteButtons");
            if (stateRemoveNodes.isDeleteButtonsVisible) {
                // Hide the buttons
                deleteButtonsDiv.style.display = "none";
                stateRemoveNodes.isDeleteButtonsVisible = false;
                buttonDeleteNodes.textContent = "Delete Nodes";
                console.log("all", stateRemoveNodes.removedElementsStack);
                enableAllButtons();
                stateRemoveNodes.removedElementsStack.forEach((elArray) => {
                    elArray.forEach((el) => {
                        console.log(el);
                        el.remove(); // Remove each element individually
                    });
                });
                currentButton = null;
            } else {
                // Show the buttons
                deleteButtonsDiv.style.display = "block";
                stateRemoveNodes.isDeleteButtonsVisible = true;
                buttonDeleteNodes.textContent = "Save";
                disableAllButtons(buttonDeleteNodes);
                currentButton = buttonDeleteNodes;
            }
        });
    });

    // Delete selected elements with button
    buttonDeleteEdges.addEventListener("click", function () {
        handleButtonClick(document.getElementById("btn-deleteEdges"), () => {

            currentButton = buttonDeleteEdges;
            if (stateRemoveEdges.isRemoveEdgesEnabled) {
                stateRemoveEdges.isRemoveEdgesEnabled = false;
                disableAllButtons(buttonDeleteEdges);
                buttonDeleteEdges.textContent = "Save";
            } else {
                stateRemoveEdges.isRemoveEdgesEnabled = true;
                enableAllButtons();
                buttonDeleteEdges.textContent = "Delete Edges";
            }
            changeStatus("Press on edge to be removed");
        });
    });

    buttonDelete.addEventListener("click", function () {
        handleButtonClick(buttonDelete, () => {

            const selectedElements = cyInit.$(":selected");

            console.log(selectedElements);
            if (selectedElements.length > 0) {
                if (confirm("Are you sure you want to delete the selected elements?")) {
                    selectedElements.remove();
                }
            } else {
                alert("No elements selected.");
            }
        });
    });


    //Modal for adding NODES
    buttonOpenModal.addEventListener("click", function () {
        handleButtonClick(buttonOpenModal, () => {
            const modal = new bootstrap.Modal(
                document.getElementById("modal-forAddNewNode")
            );
            modal.show();
            const dynamicDestinationsContainer = (document.getElementById(
                "modal-destinationDiv"
            ).innerHTML = "");
            buttonaddNewDestinationInModal.disabled = false;
            buttonSaveChangesAndApplyInNewNodeModal.disabled = false;
            const btnCloseNewModal = document.getElementById("btn-closeNewNodeModal");
            btnCloseNewModal.disabled = false;
            btnCloseNewModal.addEventListener("click", function () {
                enableAllButtons();
            })
            console.log("Modal opened");
            return Promise.resolve(); // Explicitly return a resolved Promise
        });
    });

    buttonaddNewDestinationInModal.addEventListener("click", function () {
        handleButtonClick(buttonaddNewDestinationInModal, () => {
            buttonaddNewDestinationInModal.disabled = false;
            const dynamicDestinationsContainer = document.getElementById(
                "modal-destinationDiv"
            );

            buttonDeleteNodes.addEventListener("click", function () {
                console.log("t");
                document.getElementById("deleteButtons").style.display = "block";
            });

            // Create a new input group for the destination and weight
            const newInputGroup = document.createElement("div");
            newInputGroup.classList.add("input-group", "mb-3");

            // Create the destination input
            const destinationInput = document.createElement("input");
            destinationInput.type = "text";
            destinationInput.classList.add("form-control");
            destinationInput.placeholder = "Destination Node";
            destinationInput.setAttribute("aria-label", "Destination Node");
            destinationInput.setAttribute(
                "id",
                `destination-input-id-${stateAddNodes.counterForNewDestination}`
            );

            // Create the weight input
            const weightInput = document.createElement("input");
            weightInput.type = "text";
            weightInput.classList.add("form-control");
            weightInput.placeholder = "Weight";
            weightInput.setAttribute("aria-label", "Weight");
            weightInput.setAttribute(
                "id",
                `destination-weight-id-${stateAddNodes.counterForNewDestination}`
            );

            // Append inputs to the new input group
            newInputGroup.appendChild(destinationInput);
            newInputGroup.appendChild(weightInput);

            stateAddNodes.counterForNewDestination++;
            // Append the new input group to the container
            dynamicDestinationsContainer.appendChild(newInputGroup);
        });
    });

    //Modal for applying the changes after save in modal for new nodes is pressed
    buttonSaveChangesAndApplyInNewNodeModal.addEventListener(
        "click",
        function () {
            var counter = 1;
            var currElStack = [];
            const newElements = [];
            var sourceNodeValue = document.getElementById("input-sourceNode").value;
            newElements.push({
                group: "nodes",
                data: { id: sourceNodeValue, label: sourceNodeValue },
            });

            // Process all destination inputs
            while (document.getElementById(`destination-input-id-${counter}`)) {
                let weight = document.getElementById(
                    `destination-weight-id-${counter}`
                ).value;
                let dest = document.getElementById(
                    `destination-input-id-${counter}`
                ).value;

                newElements.push({
                    group: "nodes",
                    data: { id: dest, label: dest },
                });

                // Add the edge between source and destination
                newElements.push({
                    group: "edges",
                    data: {
                        id: `${sourceNodeValue}-${dest}`, // Unique edge ID
                        source: sourceNodeValue,
                        target: dest,
                        weight: weight,
                    },
                });

                currElStack.push({ node: dest, weight: weight });
                counter++;
            }

            // Add the new elements to the graph
            cyInit.add(newElements);
            // Store the added elements in the map
            stateAddNodes.mapWithAddedElements.set(sourceNodeValue, currElStack);
            $("#modal-forAddNewNode").modal("hide");
            stateAddNodes.counterForNewDestination++;
        }
    );

    document
        .getElementById("btn-saveAllChanges")
        .addEventListener("click", function () {
            handleButtonClick(buttonaddNewDestinationInModal, () => {

                const modal = new bootstrap.Modal(
                    document.getElementById("modal-saveChanges")
                );
                modal.show();
            });
        });

    //------------ Save Changes ------------
    // Send requests one by one, cannot be sent all at once, because will have conflict on manipulating
    //the same graph
    document.getElementById("btn-saveChangesAndSendToServer").addEventListener("click", async function () {
        handleButtonClick(document.getElementById("btn-saveChangesAndSendToServer"), async () => {

            const statusLabel = document.getElementById("statusLabelModalSaveChanges");
            const progressBar = document.getElementById("progressBar");

            // Function to add text to the status modal
            function addTextToStatusInModalSaveChanges(text) {
                const t = statusLabel.innerHTML;
                statusLabel.innerHTML = t + "<br>" + text;
            }

            // Function to show the progress bar
            function showProgressBar() {
                progressBar.style.display = "block";
                progressBar.value = 0;
            }

            // Function to update the progress bar
            function updateProgress(value) {
                progressBar.value = value;
            }

            // Function to hide the progress bar
            function hideProgressBar() {
                progressBar.style.display = "none";
            }

            // Function to handle errors and display them in the modal
            function handleError(error, operation) {
                console.error(`Error during ${operation}:`, error);
                addTextToStatusInModalSaveChanges(`<span style="color: red;">Error during ${operation}: ${error.message}</span>`);
            }

            // Start the process
            showProgressBar();
            addTextToStatusInModalSaveChanges("Starting the process...");

            try {
                // Delete nodes if any
                if (stateRemoveNodes.removedElementsStack && stateRemoveNodes.removedElementsStack.length > 0) {
                    addTextToStatusInModalSaveChanges("Deleting nodes...");
                    await deleteNodes(stateRemoveNodes.removedElementsStack);
                    updateProgress(25);
                    addTextToStatusInModalSaveChanges("Nodes deleted successfully.");
                }

                // Add new connections if any
                if (stateAddEdges && stateAddEdges.sourceAndConnectedEdges.length > 0) {
                    addTextToStatusInModalSaveChanges("Adding new connections...");
                    await postAddNewConnections(stateAddEdges.sourceAndConnectedEdges);
                    updateProgress(50);
                    addTextToStatusInModalSaveChanges("Connections added successfully.");
                }

                // Delete connections if any
                if (stateRemoveEdges && stateRemoveEdges.allEdgeData.length > 0) {
                    addTextToStatusInModalSaveChanges("Deleting connections...");
                    await deleteConnections(stateRemoveEdges.allEdgeData);
                    updateProgress(75);
                    addTextToStatusInModalSaveChanges("Connections deleted successfully.");
                }

                // Process added elements if any
                if (stateAddNodes.mapWithAddedElements && stateAddNodes.mapWithAddedElements.size > 0) {
                    addTextToStatusInModalSaveChanges("Processing added elements...");
                    const jsonObj = {};

                    stateAddNodes.mapWithAddedElements.forEach((value, key) => {
                        const edges = value.map((edge) => ({
                            node: { label: edge.node },
                            weight: parseFloat(edge.weight),
                        }));

                        jsonObj[key] = edges;
                    });

                    await postAddNewNodes(jsonObj);
                    updateProgress(100);
                    addTextToStatusInModalSaveChanges("Added elements processed successfully.");
                }

                // Final success message
                addTextToStatusInModalSaveChanges("<span style='color: green;'>Process completed successfully!</span>");
            } catch (error) {
                // Handle any errors that occur during the process
                handleError(error, "saving changes");
            } finally {
                // Hide the progress bar after the process is complete
                hideProgressBar();
            }
        });
    });

    $('#modal-saveChanges').on('click', '.btn-secondary', function () {
        $('#modal-saveChanges').modal('hide');
    });

}