import { Card } from "./Card.js";
import "../styles/List.css";

export class List {
  constructor(title, onSave, onDelete) {
    this.id = Date.now();
    this.title = title;
    this.cards = [];
    this.onSave = onSave; // ✅ save function from Board
    this.onDelete = onDelete;
  }

  static fromJSON(data, onSave, onDelete) {
    const list = new List(data.title, onSave, onDelete);
    list.id = data.id;

    // Rebuild cards
    list.cards = data.cards.map((cardData) =>
      Card.fromJSON(cardData, (cardIdToDelete) => {
        list.cards = list.cards.filter((c) => c.id !== cardIdToDelete);
        list.onSave();
      })
    );

    return list;
  }

  render(container) {
    const listEl = document.createElement("div");
    listEl.classList.add("list");

    const titleEl = document.createElement("h3");
    titleEl.textContent = this.title;

    const headerEl = document.createElement("div");
    headerEl.classList.add("list-header");

    this.cardsContainer = document.createElement("div");
    this.cardsContainer.classList.add("cards-container");

    // ✅ Re-render all cards from memory
    this.cards.forEach((card) => card.render(this.cardsContainer));

    listEl.addEventListener("dragover", (e) => {
      e.preventDefault(); // ✅ allow drop
    });

    listEl.addEventListener("drop", (e) => {
      e.preventDefault();

      const cardId = e.dataTransfer.getData("text/plain");
      if (!cardId) {
        console.warn("No card ID found in dataTransfer");
        return;
      }

      console.log("📦 Dropped card ID:", cardId);

      const board = window.board;
      if (!board) {
        console.error("❌ Board not found on window");
        return;
      }

      let sourceList = null;
      let draggedCard = null;

      for (const list of board.lists) {
        const match = list.cards.find((c) => c.id == cardId);
        if (match) {
          sourceList = list;
          draggedCard = match;
          break;
        }
      }

      if (!draggedCard) {
        console.warn("❌ No card found with ID", cardId);
        return;
      }

      if (!sourceList) {
        console.warn("❌ Source list not found");
        return;
      }

      console.log("✅ Found dragged card:", draggedCard);
      console.log("📍 Source List ID:", sourceList.id);
      console.log("📍 Target List ID:", this.id);

      if (sourceList.id === this.id) {
        console.log("⚠️ Card dropped in the same list. Ignoring.");
        return;
      }

      // 🔄 Remove from source list memory and DOM
      sourceList.cards = sourceList.cards.filter((c) => c.id != cardId);
      const oldEl = sourceList.cardsContainer.querySelector(
        `[data-card-id="${cardId}"]`
      );
      if (oldEl) sourceList.cardsContainer.removeChild(oldEl);
      console.log("🧹 Removed card from source list");

      // 🔁 Update card state
      draggedCard.parentListId = this.id;

      // ✅ Re-bind onDelete so it works in this list
      draggedCard.onDelete = (cardIdToDelete) => {
        this.cards = this.cards.filter((c) => c.id !== cardIdToDelete);
        this.onSave();
      };

      // ➕ Add to this list and render
      this.cards.push(draggedCard);
      draggedCard.render(this.cardsContainer);
      console.log("📥 Moved & rendered in new list");

      // 💾 Save everything
      this.onSave();
    });

    const addCardBtn = document.createElement("button");
    addCardBtn.classList.add("add-card-btn");
    addCardBtn.innerHTML = `
  <svg class="plus-icon" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5V7.5H11a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V8.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
  </svg> Add Card
`;

    addCardBtn.addEventListener("click", () => {
      const cardTitle = prompt("Enter card title");
      const cardDesc = prompt("Enter card description");
      const newCard = new Card(
        cardTitle,
        cardDesc,
        this.id,
        (cardIdToDelete) => {
          this.cards = this.cards.filter((c) => c.id !== cardIdToDelete);
          this.onSave();
        }
      );
      this.cards.push(newCard);
      newCard.render(this.cardsContainer);
      this.onSave();
    });

    const deleteListBtn = document.createElement("button");
    deleteListBtn.classList.add("delete-list-btn");
    deleteListBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
  </svg>
`;

    deleteListBtn.addEventListener("click", () => {
      container.removeChild(listEl); // ✅ Remove from DOM
      this.onDelete(this.id); // ✅ Notify Board to remove from array
    });

    headerEl.appendChild(titleEl);
    headerEl.appendChild(deleteListBtn);

    listEl.append(headerEl, this.cardsContainer, addCardBtn);
    container.appendChild(listEl);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      cards: this.cards.map((card) => card.toJSON()),
    };
  }
}
