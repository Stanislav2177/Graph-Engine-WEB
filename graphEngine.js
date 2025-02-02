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

  //Global Vars
  var isDeleteButtonsVisible = false;
  const deletedElementsStack = [];
  const addedElementsStack = [];
  var removedElementsStack = [];
  const mapWithAddedElements = new Map();
  const lastPressedNode = [];

  var cy;
  //Global var to store the current graph
  var elements = null;
  init(); // init the graph with the fetched data
  async function init() {
    const response = await fetchGraph();
    elements = response;
  }

  const modaldestinationDiv = document.getElementById("modal-destinationDiv");
  var counterForNewDestination = 1;
  buttonFetchAllConnections.addEventListener("click", async () => {
    const dataJson = await fetchGraph();
    console.log(dataJson);
    loadDataToGraph(dataJson);
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

    cy.on("click", "node", function (event) {
      const node = event.target;
      lastPressedNode.push(node.id());
      console.log("Clicked node:", node.id());
    });

    cy.on("remove", function (event) {
      // Store deleted elements
      console.log("remove presed", event);
      deletedElementsStack.push(event.target);

      //   const t1 = {
      //     source: lastPressedNode.pop(),
      //     target: event.target._private.data.target,
      //   };

      //   removedElementsStack.push(t1);
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

  //--------- Buttons Func ----------
  // Toggle visibility on button click
  buttonDeleteNodes.addEventListener("click", function () {
    let deleteButtonsDiv = document.getElementById("deleteButtons");
    if (isDeleteButtonsVisible) {
      // Hide the buttons
      deleteButtonsDiv.style.display = "none";
      isDeleteButtonsVisible = false;
      buttonDeleteNodes.textContent = "Show Delete Buttons"; //Update button text
    } else {
      // Show the buttons
      deleteButtonsDiv.style.display = "block";
      isDeleteButtonsVisible = true;
      buttonDeleteNodes.textContent = "Hide Delete Buttons"; //Update button text
    }
  });

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
      console.log("Current added Elements");
      var jsonObj = "";

      // Save all Added Nodes
      if (mapWithAddedElements) {
        mapWithAddedElements.keys().forEach((key) => {
          console.log("key", key);
          var t3 = mapWithAddedElements.get(key);

          // Transform the data to match the Edge class structure
          const edges = t3.map((edge) => ({
            node: { label: edge.node },
            weight: parseFloat(edge.weight),
          }));

          jsonObj = {
            source: key, // Source node with a label
            target: edges, // Array of Edge objects
          };

          console.log("obj", jsonObj);
        });

        // Send the JSON object to the backend
        //  postAddNewNodes(jsonObj);
      }

      console.log("Current removed Elements");
      const map = new Map();

      const t = [];
      //   removedElementsStack.forEach((element) => {
      //     if (!map.has(element.source)) {
      //       map.set(element.source, []);
      //     }
      //     map.get(element.source).push(element.target);
      //     t.push(element.source);
      //   });

      //   // Convert the Map to a JSON object
      //   jsonObj = Object.fromEntries(map);
      //   console.log(jsonObj);
      //   console.log(t);

      //   const cleanedArray = removedElementsStack.filter(
      //     (obj) => Object.keys(obj).length > 0
      //   );
      //   const json = JSON.stringify(cleanedArray);

      //   console.log(removedElementsStack);
      //   removedElementsStack = [];
      deleteNodes(JSON.stringify([lastPressedNode.pop()])); // Wrap in an array!
    });
});
