/**
 * @jest-environment jsdom
 */

import Display from '../modules/display';
import { BOARD_SIZE } from '../modules/gameboard';

describe('Display', () => {
  let display;
  beforeEach(() => {
    document.body.innerHTML = `
            <div class="player1-grid"></div>
            <div class="player2-grid"></div>
            <dialog class="ship-placement">
                <button class="rotate">Rotate</button>
                <div class="placement-grid"></div>
            </dialog>
            <dialog class="endgame">
                <p class="endgame-message"></p>
                <button class="play-again">Play Again</button>
            </dialog>
        `;
    HTMLDialogElement.prototype.showModal = jest.fn();
    display = Display();
  });

  describe('initialize', () => {
    beforeEach(() => {
      display.initialize();
    });
    it('creates game boards with correct number of cells', () => {
      const player1Cells = document.querySelectorAll(
        '.player1-grid .grid-cells',
      );
      const player2Cells = document.querySelectorAll(
        '.player2-grid .grid-cells',
      );
      const placementGridCells = document.querySelectorAll(
        '.placement-grid .grid-cells',
      );

      expect(player1Cells.length).toBe(100);
      expect(player2Cells.length).toBe(100);
      expect(placementGridCells.length).toBe(100);
    });

    it('adds correct data attributes to cells', () => {
      const cell = document.querySelector(
        '.player1-grid .grid-cells[data-row="4"][data-col="6"]',
      );
      expect(cell).not.toBeNull();
      expect(cell.dataset.index).toBe('46');
    });

    it('display the ship placement dialog when the page is loaded', () => {
      const dialog = document.querySelector('.ship-placement');
      expect(dialog.showModal).toHaveBeenCalled();
    });
  });

  describe('updateBoard', () => {
    let mockBoard;
    beforeEach(() => {
      // Create a mock of a player's board
      mockBoard = Array.from(Array(BOARD_SIZE), () =>
        Array(BOARD_SIZE)
          .fill()
          .map(() => ({ content: null, hit: false })),
      );
      // Place a ship at [2, 3] and [2, 4]
      mockBoard[2][3].content = 1;
      mockBoard[2][4].content = 1;
      // A hit on [2, 3]
      mockBoard[2][3].hit = true;
      // A miss [2, 5]
      mockBoard[2][5].hit = true;
      display.initialize();
    });
    it('updates player\'s board correctly with ships visible, hits, and misses', () => {
      const playerGrid = document.querySelector('.player1-grid');
      display.updateBoard(mockBoard, playerGrid, true);

      // Check ship
      const shipCell1 = playerGrid.querySelector(
        '.grid-cells[data-row="2"][data-col="3"]',
      );
      const shipCell2 = playerGrid.querySelector(
        '.grid-cells[data-row="2"][data-col="4"]',
      );

      expect(shipCell1.classList.contains('ship')).toBe(true);
      expect(shipCell2.classList.contains('ship')).toBe(true);

      // Check hit on ship
      expect(shipCell1.classList.contains('hit')).toBe(true);

      // Check miss
      const missCell = playerGrid.querySelector(
        '.grid-cells[data-row="2"][data-col="5"]',
      );
      expect(missCell.classList.contains('miss')).toBe(true);
    });

    it('updates computer\'s board correctly with ships not visible, hits, and misses', () => {
      const playerGrid = document.querySelector('.player1-grid');
      display.updateBoard(mockBoard, playerGrid);

      // Check ship
      const shipCell1 = playerGrid.querySelector(
        '.grid-cells[data-row="2"][data-col="3"]',
      );
      const shipCell2 = playerGrid.querySelector(
        '.grid-cells[data-row="2"][data-col="4"]',
      );

      expect(shipCell1.classList.contains('ship')).toBe(false);
      expect(shipCell2.classList.contains('ship')).toBe(false);

      // Check hit on ship
      expect(shipCell1.classList.contains('hit')).toBe(true);

      // Check miss
      const missCell = playerGrid.querySelector(
        '.grid-cells[data-row="2"][data-col="5"]',
      );
      expect(missCell.classList.contains('miss')).toBe(true);
    });
  });
});
