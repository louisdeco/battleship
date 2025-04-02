import { BOARD_SIZE } from './gameboard';

function Display() {
  // Cache DOM elements
  const playerGrid = document.querySelector('.player1-grid');
  const computerGrid = document.querySelector('.player2-grid');
  const shipPlacementDialog = document.querySelector('.ship-placement');
  const placementGrid = document.querySelector('.placement-grid');
  // const endgameDialog = document.querySelector('.endgame');
  // const endgameMessage = document.querySelector('.endgame-message');

  function initialize() {
    createGrid(playerGrid);
    createGrid(computerGrid);
    createGrid(placementGrid);
    showPlacementShipDialog();
  }

  function createGrid(container) {
    for (let i = 0; i < 100; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cells');
      cell.dataset.index = i;
      cell.dataset.row = Math.floor(i / BOARD_SIZE);
      cell.dataset.col = i % BOARD_SIZE;
      container.appendChild(cell);
    }
  }

  function showPlacementShipDialog() {
    shipPlacementDialog.showModal();
  }

  function updateBoardDisplay(playerBoard, computerBoard) {
    updateBoard(playerBoard, playerGrid, true);
    updateBoard(computerBoard, computerGrid);
  }

  function updateBoard(gameboard, gridElement, showShips = false) {
    const displayCells = gridElement.querySelectorAll('.grid-cells');
    displayCells.forEach((displayCell) => {
      const row = parseInt(displayCell.dataset.row);
      const col = parseInt(displayCell.dataset.col);
      const boardCell = gameboard[row][col];

      // Clean the cell
      displayCell.classList.remove('ship', 'hit', 'miss');

      // Update the cell display
      if (showShips && boardCell.content !== null)
        displayCell.classList.add('ship');
      if (boardCell.hit)
        displayCell.classList.add(boardCell.content !== null ? 'hit' : 'miss');
    });
  }

  function setupAttackHandlers(attackCallback) {
    computerGrid.addEventListener('click', (e) => {
      if (!e.target.classList.contains('grid-cells')) return;
      if (
        e.target.classList.contains('hit') ||
        e.target.classList.contains('miss')
      )
        return;

      const row = parseInt(e.target.dataset.row);
      const col = parseInt(e.target.dataset.col);

      attackCallback(row, col);
    });
  }

  return { initialize, updateBoardDisplay, setupAttackHandlers };
}

export default Display;
