// main.js
import { initUI } from "./ui.js";
import { loadDataToGraph } from "./graph.js";
import { fetchGraph } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    initUI();
    loadDataToGraph();
});