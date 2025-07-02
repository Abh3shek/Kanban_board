import "../styles/Card.css";

export class Card {
  constructor(title, description, parentListId, onDelete) {
    this.id = Date.now(); // or a UUID
    this.title = title;
    this.description = description;
    this.parentListId = parentListId; // helps when moving cards
    this.onDelete = onDelete;
  }

  static fromJSON(data, onDelete) {
    const card = new Card(
      data.title,
      data.description,
      data.parentListId,
      onDelete
    );
    card.id = data.id; // Preserve original ID
    return card;
  }

  render(container) {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.setAttribute("draggable", true); // prep for drag & drop
    cardEl.dataset.cardId = this.id;
    cardEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", this.id);
    });

    const titleEl = document.createElement("h4");
    titleEl.textContent = this.title;

    const descEl = document.createElement("p");
    descEl.textContent = this.description;

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-card-btn");
    deleteBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
  </svg>
`;

    deleteBtn.addEventListener("click", () => {
      // Remove card DOM
      container.removeChild(cardEl);
      this.onDelete(this.id);

      // Remove from parent list's cards array
      // Do it cleanly by letting the parent list know:
      this.removeFromParent();
    });

    cardEl.append(titleEl, descEl, deleteBtn);

    // OPTIONAL: add drag event handlers here later

    container.appendChild(cardEl);
  }

  // Helper to cleanly remove self from parent List
  removeFromParent() {
    // Find the parent List in Board.lists by ID
    // Remove self by ID from its cards array
    // Save state if you have localStorage
    // This version is a placeholder: you may want to pass
    // a callback or use events for cleaner separation.
    console.log(
      `Card ${this.id} should remove itself from parent list ${this.parentListId}`
    );
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      parentListId: this.parentListId,
    };
  }
}
