import { List } from "./List.js";
import "../styles/Board.css";

export class Board {
  constructor(title) {
    this.title = title;
    this.lists = [];
  }

  static fromJSON(data) {
    const board = new Board(data.title);

    board.lists = data.lists.map((listData) =>
      List.fromJSON(
        listData,
        () => board.save(),
        (listIdToDelete) => {
          // onDelete
          board.lists = board.lists.filter((l) => l.id !== listIdToDelete);
          board.save();
        }
      )
    );

    return board;
  }

  render(container) {
    const boardEl = document.createElement("div");
    boardEl.classList.add("board");

    const titleEl = document.createElement("h2");
    titleEl.textContent = this.title;

    this.listsContainer = document.createElement("div");
    this.listsContainer.classList.add("lists-container");

    // ✅ Re-render saved lists
    this.lists.forEach((list) => list.render(this.listsContainer));

    const addListBtn = document.createElement("button");
    addListBtn.classList.add("add-list-btn");
    addListBtn.innerHTML = `
  <svg class="plus-icon" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5V7.5H11a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V8.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
  </svg> Add List
`;
    addListBtn.addEventListener("click", () => {
      const listTitle = prompt("Enter list title");
      if (!listTitle) return;
      const newList = new List(
        listTitle,
        () => this.save(),
        (listIdToDelete) => {
          // onDelete
          this.lists = this.lists.filter((l) => l.id !== listIdToDelete);
          this.save();
        }
      );
      this.lists.push(newList);
      newList.render(this.listsContainer);
      this.save();
    });

    // ✅ Wrap listsContainer and addListBtn in a flex container
    const listSectionEl = document.createElement("div");
    listSectionEl.classList.add("list-section");
    listSectionEl.append(this.listsContainer, addListBtn);

    boardEl.append(titleEl, listSectionEl);
    container.appendChild(boardEl);
  }

  toJSON() {
    return {
      title: this.title,
      lists: this.lists.map((list) => list.toJSON()),
    };
  }
  save() {
    const data = this.toJSON();
    localStorage.setItem("kanban", JSON.stringify(data));
  }
}
