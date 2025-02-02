const apiFetchGraph = "http://localhost:8082/graph";
const apiPostAddNodes = "http://localhost:8082/graph/add-node";
const apiDeleteNodes = "http://localhost:8082/graph/specificNodes";

async function fetchGraph() {
  try {
    const response = await fetch(apiFetchGraph);
    if (!response.ok) throw new Error("Network response was not ok");

    const dataJson = await response.json();
    return dataJson;
  } catch (error) {
    console.log("Error fetching data: ", error);
    return ""; //
  }
}

async function postAddNewNodes(obj) {
  fetch(apiPostAddNodes, {
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

async function deleteNodes(obj) {
  fetch(apiDeleteNodes, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
}
