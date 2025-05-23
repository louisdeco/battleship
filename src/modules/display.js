import { BOARD_SIZE } from './gameboard.js';

function Display() {
  // Cache DOM elements
  const playerGrid = document.querySelector('.player1-grid');
  const computerGrid = document.querySelector('.player2-grid');
  const shipPlacementDialog = document.querySelector('.ship-placement');
  const placementGrid = document.querySelector('.placement-grid');
  const rotateButton = document.querySelector('.rotate');
  const endgameDialog = document.querySelector('.endgame');
  const endgameMessage = document.querySelector('.endgame-message');
  const playAgainButton = document.querySelector('.play-again');

  function initialize() {
    createGrid(playerGrid);
    createGrid(computerGrid);
    createGrid(placementGrid);
    showPlacementShipDialog();
  }

  function createGrid(container) {
    // Clear existing grid cells
    container.innerHTML = '';

    for (let i = 0; i < 100; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
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
    const displayCells = gridElement.querySelectorAll('.grid-cell');
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
      if (!e.target.classList.contains('grid-cell')) return;
      if (
        e.target.classList.contains('hit') ||
        e.target.classList.contains('miss')
      )
        return;

      const { row, col } = getCoordinatesFromCell(e.target);

      attackCallback(row, col);
    });
  }

  function setupShipPlacement(ships, placementCallback, validationCallback) {
    let shipsToPlace = [...ships];
    let currentShip = shipsToPlace[0];
    let isVertical = false;

    function cleanAllShipPlacements() {
      const cells = placementGrid.querySelectorAll('.grid-cell');
      cells.forEach((cell) => {
        cell.classList.remove('ship');
      });
    }

    // Clean existing ship placements at the start
    cleanAllShipPlacements();

    const rotateHandler = () => (isVertical = !isVertical);

    const mouseoverHandler = (e) => {
      if (!e.target.classList.contains('grid-cell')) return;

      const { row, col } = getCoordinatesFromCell(e.target);

      clearPreviews();

      const isValid = validationCallback(
        currentShip.size,
        row,
        col,
        isVertical,
      );
      showShipPreview(row, col, currentShip.size, isVertical, isValid);
    };

    const mouseoutHandler = () => clearPreviews();

    const clickHandler = (e) => {
      if (!e.target.classList.contains('grid-cell') || !currentShip) return;

      const { row, col } = getCoordinatesFromCell(e.target);

      const isValid = validationCallback(
        currentShip.size,
        row,
        col,
        isVertical,
      );
      if (isValid) {
        clearPreviews();
        placementCallback(currentShip.size, row, col, isVertical);
        placeShipInGrid(row, col, currentShip.size, isVertical);

        if (shipsToPlace.length > 0) {
          shipsToPlace.shift();
          if (shipsToPlace.length === 0) {
            cleanUpEventListeners();
            shipPlacementDialog.close();
          } else currentShip = shipsToPlace[0];
        }
      }
    };

    rotateButton.addEventListener('click', rotateHandler);
    placementGrid.addEventListener('mouseover', mouseoverHandler);
    placementGrid.addEventListener('mouseout', mouseoutHandler);
    placementGrid.addEventListener('click', clickHandler);

    function cleanUpEventListeners() {
      rotateButton.removeEventListener('click', rotateHandler);
      placementGrid.removeEventListener('mouseover', mouseoverHandler);
      placementGrid.removeEventListener('mouseout', mouseoutHandler);
      placementGrid.removeEventListener('click', clickHandler);
    }
  }

  function clearPreviews() {
    const cells = placementGrid.querySelectorAll('.grid-cell');
    cells.forEach((cell) => {
      cell.classList.remove('ship-preview', 'invalid-placement');
    });
  }

  function applyClassToShipCells(row, col, shipSize, isVertical, className) {
    for (let i = 0; i < shipSize; i++) {
      const newRow = isVertical ? row + i : row;
      const newCol = isVertical ? col : col + i;

      if (row >= BOARD_SIZE || col >= BOARD_SIZE) continue;
      const cell = placementGrid.querySelector(
        `.grid-cell[data-row="${newRow}"][data-col="${newCol}"]`,
      );
      if (cell) cell.classList.add(className);
    }
  }

  function showShipPreview(row, col, shipSize, isVertical, isValid) {
    const className = isValid ? 'ship-preview' : 'invalid-placement';

    applyClassToShipCells(row, col, shipSize, isVertical, className);
  }

  function placeShipInGrid(row, col, shipSize, isVertical) {
    applyClassToShipCells(row, col, shipSize, isVertical, 'ship');
  }

  function getCoordinatesFromCell(cell) {
    return {
      row: parseInt(cell.dataset.row),
      col: parseInt(cell.dataset.col),
    };
  }

  function showGameOver(playerWon) {
    endgameMessage.textContent = playerWon ? 'You Won!' : 'Computer Won!';
    endgameDialog.showModal();
  }

  function setupPlayAgainButton(resetCallback) {
    playAgainButton.addEventListener('click', () => {
      endgameDialog.close();
      resetCallback();
    });
  }

  return {
    initialize,
    updateBoardDisplay,
    setupAttackHandlers,
    setupShipPlacement,
    showGameOver,
    setupPlayAgainButton,
  };
}

export default Display;
