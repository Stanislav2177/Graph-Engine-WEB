const apiFetchGraph = "http://localhost:8082/graph";
const apiPostAddNodes = "http://localhost:8082/graph/add-node";
const apiDeleteNodes = "http://localhost:8082/graph/specificNodes";
const apiPostNewConnections = "http://localhost:8082/graph/add-connections";
const apiDeleteNewConnections = "http://localhost:8082/graph/deleteConnections";

// Fetch graph data
export async function fetchGraph() {
  try {
    const response = await fetch(apiFetchGraph);
    if (!response.ok) throw new Error("Network response was not ok");

    const dataJson = await response.json();
    return dataJson;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
}

// Add new nodes
export async function postAddNewNodes(obj) {
  try {
    const response = await fetch(apiPostAddNodes, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding new nodes: ", error);
    throw error;
  }
}

// Add new connections
export async function postAddNewConnections(obj) {
  try {
    const response = await fetch(apiPostNewConnections, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding new connections: ", error);
    throw error;
  }
}

// Delete nodes
export async function deleteNodes(obj) {
  try {
    const response = await fetch(apiDeleteNodes, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting nodes: ", error);
    throw error;
  }
}

// Delete connections
export async function deleteConnections(obj) {
  try {
    const response = await fetch(apiDeleteNewConnections, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting connections: ", error);
    throw error;
  }
}