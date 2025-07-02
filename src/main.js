import "../src/style.css"; // Global styles
import { Board } from "./components/Board.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("#app");
  let board;

  // 🔄 Try to load board from localStorage
  const savedData = localStorage.getItem("kanban");

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      board = Board.fromJSON(parsed);
      console.log("✅ Loaded board from localStorage");
    } catch (err) {
      console.error("❌ Failed to parse saved board:", err);
      board = new Board("Project Board");
    }
  } else {
    board = new Board("Project Board");
    console.log("🆕 Started new board");
  }

  board.render(app);

  // 🧪 For debugging in console
  window.board = board;
});
