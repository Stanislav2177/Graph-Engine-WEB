document.addEventListener("DOMContentLoaded", () => {
  //Buttons Init
  const buttonFetchAllConnections = document.getElementById(
    "fetchAllConnections"
  );
  const buttonOpenModal = document.getElementById("btn-openModalForNewNode");
  const buttonaddNewDestinationInModal = document.getElementById(
    "btn-addNewDestinationInModal"
  );

  const buttonSaveChangesAndApplyInNewNodeModal = document.getElementById(
    "btn-saveChangesAndApplyInNewNodeModal"
  );
  const buttonDeleteNodes = document.getElementById("btn-deleteNodes");
  const buttonUndoDelete = document.getElementById("undo-button");
  const buttonDelete = document.getElementById("delete-button");
  const buttonAddEdge = document.getElementById("add-edge-btn");
  const buttonFindShortestPath = document.getElementById("btn-findShortestPath");
  //Global Vars
  var isDeleteButtonsVisible = false;
  const deletedElementsStack = [];
  var removedElementsStack = [];
  const mapWithAddedElements = new Map();
  const lastPressedNode = [];
  var isActionActivated = false;

  const stateFetchData = {
    elementsInit: null,
    isDataAlreadyLoaded: false
  }
  const stateAddEdges = {
    counter: 0,
    isAddEdgesBetweenNodesVisible: false,
    isAddEdgeEnabled: false,
    allClickedNodes: [],
    currentClickedNode: "",
    sourceAndConnectedEdges: [],
  };

  const stateRemoveEdges = {
    isRemoveEdgesEnabled: false,
    allEdgeData: [],
    undoRemovingEdge: []
  }

  const stateFindShortestPath = {
    isFindShortestPathActive: false,
    source: "",
    target: ""
  }

  var cy;

  // init the graph with the fetched data
  init();
  async function init() {
    const response = await fetchGraph();
    stateFetchData.elementsInit = response;
  }

  const modaldestinationDiv = document.getElementById("modal-destinationDiv");
  var counterForNewDestination = 1;
  buttonFetchAllConnections.addEventListener("click", async () => {
    changeStatus("Fetching Data from server");
    const dataJson = await fetchGraph();
    console.log(dataJson);
    loadDataToGraph(dataJson);
    if (!dataJson) {
      changeStatus("Problem with fetching data, check internet connection !");
    } else {
      stateFetchData.elementsInit = dataJson;
      stateFetchData.isDataAlreadyLoaded = true;
      setTimeOutFn("Waiting for action...", 1000)
    }
  });

  function loadDataToGraph(dataJson) {
    cy = cytoscape({
      container: document.getElementById("cy"), // HTML container element
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
          },
        })),
      },
      style: [
        {
          selector: "node", // Apply styles to all nodes
          style: {
            "background-color": "#0074D9",
            label: "data(label)", // Access the label property
            color: "#fff",
            "text-valign": "center",
            "text-outline-width": 1,
            "text-outline-color": "#000",
          },
        },
        {
          selector: "edge", // Apply styles to all edges
          style: {
            width: 2,
            "line-color": "#FF4136",
            "target-arrow-color": "#FF4136",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(weight)", // Access the weight property
          },
        },
      ],
      layout: {
        name: "grid",
        rows: 3,
      },
    });

    //Click on Node
    cy.on("click", "node", function (event) {
      const node = event.target;
      lastPressedNode.push(node.id());

      if (!isActionActivated) {
        if (stateAddEdges.isAddEdgeEnabled) {
          stateAddEdges.currentClickedNode = node.id();
          stateAddEdges.allClickedNodes.push(stateAddEdges.currentClickedNode);
          if (stateAddEdges.allClickedNodes.length == 1) {
            addTextToStatus("Source add edge: " + stateAddEdges.currentClickedNode);
          } else {
            addTextToStatus("Target add edge: " + stateAddEdges.currentClickedNode);
          }
          isActionActivated = true;
          console.log(stateAddEdges.allClickedNodes);
        } else {
          changeStatus(`Clicked node:${node.id()}`);
        }
      }

      if (stateFindShortestPath.isFindShortestPathActive) {
        if (stateFindShortestPath.source == "") {
          stateFindShortestPath.source = node.id();
          addTextToStatus("Source: " + stateFindShortestPath.source);
          console.log("source:", stateFindShortestPath.source);
        }
        else {
          stateFindShortestPath.target = node.id();
          addTextToStatus("Target: " + stateFindShortestPath.target);
          console.log("target:", stateFindShortestPath.target);
        }

        if (stateFindShortestPath.source != "" && stateFindShortestPath.target != "") {
          stateFindShortestPath.isFindShortestPathActive = false;
        }
      }
    });

    //Click on Connection
    cy.on('tap', 'edge', function (event) {
      const edge = event.target; // the clicked edge
      const edgeData = edge.data();
      if (stateRemoveEdges.isRemoveEdgesEnabled && !isActionActivated) {
        stateRemoveEdges.allEdgeData.push(edgeData);
        edge.remove();
        console.log("test");
      } else {
        changeStatus(`Source: ${edgeData.source}; Target: ${edgeData.target}; Weight: ${edgeData.weight} `)
      }
    });

    cy.on("remove", function (event) {
      // Store deleted elements
      deletedElementsStack.push(event.target);
      removedElementsStack.push(lastPressedNode.pop());
    });

    buttonUndoDelete.addEventListener("click", function () {
      const lastDeletedElement = deletedElementsStack.pop();
      if (lastDeletedElement) {
        cy.add(lastDeletedElement);
      } else {
        alert("Nothing to undo.");
      }
    });
  }

  //---------------- Reset graph -------------------
  document.getElementById("resetGraph").addEventListener("click", function () {
    if (stateFetchData.isDataAlreadyLoaded) {
      loadDataToGraph(stateFetchData.elementsInit);
    } else {
      changeStatus("Fetch Data first");
    }
  })

  function findShortestPath(sourceId, targetId) {
    const dijkstra = cy.elements().dijkstra(`#${sourceId}`, (edge) => edge.data("weight"));
    const path = dijkstra.pathTo(cy.$(`#${targetId}`));
    path.addClass("highlighted");
    console.log("Shortest path:", path.map((ele) => ele.id()));

    cy.style()
      .selector(".highlighted")
      .style({
        "line-color": "red",
        width: 4,
      })
      .update();
  }


  buttonFindShortestPath.addEventListener("click", function () {
    if (!stateFindShortestPath.isFindShortestPathActive) {
      stateFindShortestPath.isFindShortestPathActive = true;
      changeStatus("Choose Source and Target:");
      isActionActivated = true;
      buttonFindShortestPath.textContent = "Finish";
    } else {
      if (stateFindShortestPath.source == "" || stateFindShortestPath.target == "") {
        changeStatus("Missing node");
        stateFindShortestPath.isFindShortestPathActive = false;
        setTimeOutFn("base", 1000);
        buttonFindShortestPath.textContent = "Find Shortest Path";
      } else {
        console.log("finding shortest path")
        findShortestPath(stateFindShortestPath.source, stateFindShortestPath.target);
      }
    }
  })

  // ---------------- Add a new edge between nodes A and D ----------------
  buttonAddEdge.addEventListener("click", function () {
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
          cy.add({
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
    } else {
      changeStatus("Select Source Node:");
      buttonAddEdge.textContent = "Finish";
      stateAddEdges.isAddEdgeEnabled = true;

      stateAddEdges.isAddEdgesBetweenNodesVisible = true;
      document.getElementById("addWeightBtwEdges").style.display = "block";
    }
  });

  //--------- Buttons Func ----------
  // Toggle visibility on button click
  buttonDeleteNodes.addEventListener("click", function () {
    let deleteButtonsDiv = document.getElementById("deleteButtons");
    if (isDeleteButtonsVisible) {
      // Hide the buttons
      deleteButtonsDiv.style.display = "none";
      isDeleteButtonsVisible = false;
      buttonDeleteNodes.textContent = "Show Delete Buttons";
    } else {
      // Show the buttons
      deleteButtonsDiv.style.display = "block";
      isDeleteButtonsVisible = true;
      buttonDeleteNodes.textContent = "Hide Delete Buttons";
    }
  });


  document.getElementById("btn-deleteEdges").addEventListener("click", function () {
    stateRemoveEdges.isRemoveEdgesEnabled = true;
    changeStatus("Press on edge to be removed");
  })

  // Delete selected elements with button
  buttonDelete.addEventListener("click", function () {
    const selectedElements = cy.$(":selected");
    console.log(selectedElements);
    if (selectedElements.length > 0) {
      if (confirm("Are you sure you want to delete the selected elements?")) {
        selectedElements.remove();
      }
    } else {
      alert("No elements selected.");
    }
  });

  buttonOpenModal.addEventListener("click", function () {
    const modal = new bootstrap.Modal(
      document.getElementById("modal-forAddNewNode")
    );
    modal.show();
    const dynamicDestinationsContainer = (document.getElementById(
      "modal-destinationDiv"
    ).innerHTML = "");
    console.log("Modal opened");
  });

  //Modal for adding NODES
  buttonaddNewDestinationInModal.addEventListener("click", function () {
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
      `destination-input-id-${counterForNewDestination}`
    );

    // Create the weight input
    const weightInput = document.createElement("input");
    weightInput.type = "text";
    weightInput.classList.add("form-control");
    weightInput.placeholder = "Weight";
    weightInput.setAttribute("aria-label", "Weight");
    weightInput.setAttribute(
      "id",
      `destination-weight-id-${counterForNewDestination}`
    );

    // Append inputs to the new input group
    newInputGroup.appendChild(destinationInput);
    newInputGroup.appendChild(weightInput);

    counterForNewDestination++;
    // Append the new input group to the container
    dynamicDestinationsContainer.appendChild(newInputGroup);
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
      cy.add(newElements);
      // Store the added elements in the map
      mapWithAddedElements.set(sourceNodeValue, currElStack);
      $("#modal-forAddNewNode").modal("hide");
      counterForNewDestination = 1;
    }
  );

  document
    .getElementById("btn-saveAllChanges")
    .addEventListener("click", function () {
      const modal = new bootstrap.Modal(
        document.getElementById("modal-saveChanges")
      );
      modal.show();
    });

  //------------ Save Changes ------------
  // Send requests one by one, cannot be sent all at once, because will have conflict on manipulating
  //the same graph
  document
    .getElementById("btn-saveChangesAndSendToServer")
    .addEventListener("click", async function () {
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
        if (removedElementsStack && removedElementsStack.length > 0) {
          addTextToStatusInModalSaveChanges("Deleting nodes...");
          await deleteNodes(removedElementsStack);
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
        if (mapWithAddedElements && mapWithAddedElements.size > 0) {
          addTextToStatusInModalSaveChanges("Processing added elements...");
          const jsonObj = {};

          mapWithAddedElements.forEach((value, key) => {
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

  function changeStatus(text) {
    if (text == "base") {
      document.getElementById("statusLabel").innerHTML =
        "Status: Waiting for action...";
    } else {
      document.getElementById("statusLabel").innerHTML = text;
    }
  }

  function setTimeOutFn(status, ms) {
    if (typeof status === "string" && Number.isInteger(ms)) {
      setTimeout(() => {
        changeStatus(status);
      }, ms);
    } else {
      setTimeout(() => {
        changeStatus("base");
      }, 3000);
    }
  }
  function addTextToStatus(text) {
    var t = document.getElementById("statusLabel").innerHTML;
    document.getElementById("statusLabel").innerHTML = t + "<br>" + text;
  }

  function addTextToStatusInModalSaveChanges(text) {
    var t = document.getElementById("statusLabelModalSaveChanges").innerHTML;
    document.getElementById("statusLabelModalSaveChanges").innerHTML = t + "<br>" + text;
  }


  $('#modal-saveChanges').on('click', '.btn-secondary', function () {
    // Perform additional actions here
    $('#modal-saveChanges').modal('hide'); // Manually hide the modal if needed
  });
});
