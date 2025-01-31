document.addEventListener("DOMContentLoaded", () => {
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
  const modaldestinationDiv = document.getElementById("modal-destinationDiv");
  var counterForNewDestination = 1;
  if (buttonFetchAllConnections) {
    buttonFetchAllConnections.addEventListener("click", async () => {
      try {
        const response = await fetch("http://localhost:8082/graph");
        if (!response.ok) throw new Error("Network response was not ok");

        const dataJson = await response.json();
        console.log(dataJson);
        loadDataToGraph(dataJson);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    });
  } else {
    console.error("Button with id 'fetchAllConnections' not found in the DOM.");
  }

  function loadDataToGraph(dataJson) {
    const cy = cytoscape({
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
  }

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

  buttonaddNewDestinationInModal.addEventListener("click", function () {
    const dynamicDestinationsContainer = document.getElementById(
      "modal-destinationDiv"
    );

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
      var newNodes = [];

      while (document.getElementById(`destination-input-id-${counter}`)) {
        let weight = document.getElementById(
          `destination-weight-id-${counter}`
        ).value;
        let dest = document.getElementById(
          `destination-input-id-${counter}`
        ).value;
        console.log(weight);
        console.log(dest);
        newNodes.push({ node: dest, weight: weight });

        counter++;
      }
      //Construct a json object which backend to receive
      var sourceNodeValue = document.getElementById("input-sourceNode").value;
      var obj = {
        source: sourceNodeValue,
        destinations: newNodes,
      };
      $("#modal-forAddNewNode").modal("hide");

      //reset the globar var for the counter which is used to make a new
      //destionation nodes in the modal
      counterForNewDestination = 1;

      fetch("http://localhost:8082/graph/add-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    }
  );

  buttonSaveChangesAndApplyInNewNodeModal;

  function parseJson(json) {
    return JSON.parse(json);
  }
});
