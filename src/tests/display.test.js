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
    HTMLDialogElement.prototype.close = jest.fn();

    display = Display();
  });

  describe('initialize', () => {
    beforeEach(() => {
      display.initialize();
    });
    it('creates game boards with correct number of cells', () => {
      const player1Cells = document.querySelectorAll(
        '.player1-grid .grid-cell',
      );
      const player2Cells = document.querySelectorAll(
        '.player2-grid .grid-cell',
      );
      const placementGridCells = document.querySelectorAll(
        '.placement-grid .grid-cell',
      );

      expect(player1Cells.length).toBe(100);
      expect(player2Cells.length).toBe(100);
      expect(placementGridCells.length).toBe(100);
    });

    it('adds correct data attributes to cells', () => {
      const cell = document.querySelector(
        '.player1-grid .grid-cell[data-row="4"][data-col="6"]',
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
      display.updateBoardDisplay(mockBoard, mockBoard);
    });
    it('updates player\'s board correctly with ships visible, hits, and misses', () => {
      const playerGrid = document.querySelector('.player1-grid');

      // Check ship
      const shipCell1 = playerGrid.querySelector(
        '.grid-cell[data-row="2"][data-col="3"]',
      );
      const shipCell2 = playerGrid.querySelector(
        '.grid-cell[data-row="2"][data-col="4"]',
      );

      expect(shipCell1.classList.contains('ship')).toBe(true);
      expect(shipCell2.classList.contains('ship')).toBe(true);

      // Check hit on ship
      expect(shipCell1.classList.contains('hit')).toBe(true);

      // Check miss
      const missCell = playerGrid.querySelector(
        '.grid-cell[data-row="2"][data-col="5"]',
      );
      expect(missCell.classList.contains('miss')).toBe(true);
    });

    it('updates computer\'s board correctly with ships not visible, hits, and misses', () => {
      const computerGrid = document.querySelector('.player2-grid');

      // Check ship
      const shipCell1 = computerGrid.querySelector(
        '.grid-cell[data-row="2"][data-col="3"]',
      );
      const shipCell2 = computerGrid.querySelector(
        '.grid-cell[data-row="2"][data-col="4"]',
      );

      expect(shipCell1.classList.contains('ship')).toBe(false);
      expect(shipCell2.classList.contains('ship')).toBe(false);

      // Check hit on ship
      expect(shipCell1.classList.contains('hit')).toBe(true);

      // Check miss
      const missCell = computerGrid.querySelector(
        '.grid-cell[data-row="2"][data-col="5"]',
      );
      expect(missCell.classList.contains('miss')).toBe(true);
    });
  });

  describe('setupAttackHandlers', () => {
    let mockAttackCallback, cell;
    beforeEach(() => {
      display.initialize();
      mockAttackCallback = jest.fn();
      display.setupAttackHandlers(mockAttackCallback);
      cell = document.querySelector(
        '.player2-grid .grid-cell[data-row="0"][data-col="1"]',
      );
    });
    it('calls attack callback with correct coordinates', () => {
      cell.click();
      expect(mockAttackCallback).toHaveBeenCalledWith(0, 1);
    });
    it('does not call attack callback when clicking on a hit cell', () => {
      cell.classList.add('hit');
      cell.click();
      expect(mockAttackCallback).not.toHaveBeenCalled();
    });
    it('does not call attack callback when clicking on a missed cell', () => {
      cell.classList.add('miss');
      cell.click();
      expect(mockAttackCallback).not.toHaveBeenCalled();
    });
    it('does not call attack callback when clicking the grid container itself', () => {
      const gridContainer = document.querySelector('.player2-grid');
      gridContainer.click();
      expect(mockAttackCallback).not.toHaveBeenCalled();
    });
  });

  describe('setupShipPlacement', () => {
    let ships, mockValidationCallback, mockPlacementCallback;
    beforeEach(() => {
      display.initialize();
      ships = [{ name: 'Destroyer', size: 2 }];
      mockValidationCallback = jest.fn();
      mockPlacementCallback = jest.fn();
    });
    describe('ship preview', () => {
      let mouseoverEvent;
      beforeEach(() => {
        mouseoverEvent = new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
        });
      });

      function setupShipPreviewTest(isVertical, isValid) {
        mockValidationCallback.mockReturnValue(isValid);
        display.setupShipPlacement(
          ships,
          mockPlacementCallback,
          mockValidationCallback,
        );

        // Set orientation
        if (isVertical) {
          const rotateButton = document.querySelector('.rotate');
          rotateButton.click();
        }

        // Create and dispatch a mouseover event on the first cell
        const shipCell1 = document.querySelector(
          '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
        );
        shipCell1.dispatchEvent(mouseoverEvent);
      }

      it('preview the ship on the correct cells horizontally', () => {
        // Setup
        setupShipPreviewTest(false, true);
        const className = 'ship-preview';
        const previewCells = document.querySelectorAll(`.${className}`);
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          false,
        );
        // Two cells must have the className associated with preview
        expect(previewCells.length).toBe(2);
        // For a horizontal preview, the cell (0, 0) and (0, 1) must have the correct className
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
            )
            .classList.contains(className),
        ).toBe(true);
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="1"]',
            )
            .classList.contains(className),
        ).toBe(true);
      });
      it('preview the ship on the correct cells vertically', () => {
        // Setup
        setupShipPreviewTest(true, true);
        const className = 'ship-preview';
        const previewCells = document.querySelectorAll(`.${className}`);
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          true,
        );
        // Two cells must have the className associated with preview
        expect(previewCells.length).toBe(2);
        // For a vertical preview, the cell (0, 0) and (1, 0) must have the correct className
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
            )
            .classList.contains(className),
        ).toBe(true);
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="1"][data-col="0"]',
            )
            .classList.contains(className),
        ).toBe(true);
      });
      it('show invalid placement horizontally', () => {
        // Setup
        setupShipPreviewTest(false, false);
        const className = 'invalid-placement';
        const previewCells = document.querySelectorAll(`.${className}`);
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          false,
        );
        // Two cells must have the className associated with an invalid preview
        expect(previewCells.length).toBe(2);
        // For a horizontal invalid preview, the cell (0, 0) and (0, 1) must have the correct className
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
            )
            .classList.contains(className),
        ).toBe(true);
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="1"]',
            )
            .classList.contains(className),
        ).toBe(true);
      });
      it('show invalid placement vertically', () => {
        // Setup
        setupShipPreviewTest(true, false);
        const className = 'invalid-placement';
        const previewCells = document.querySelectorAll(`.${className}`);
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          true,
        );
        // Two cells must have the className associated with an invalid preview
        expect(previewCells.length).toBe(2);
        // For a vertical invalid preview, the cell (0, 0) and (1, 0) must have the correct className
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
            )
            .classList.contains(className),
        ).toBe(true);
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="1"][data-col="0"]',
            )
            .classList.contains(className),
        ).toBe(true);
      });
      it('clears previews when mouse leaves a cell', () => {
        //Setup
        setupShipPreviewTest(false, true);
        const mouseoutEvent = new MouseEvent('mouseout', {
          bubbles: true,
          cancelable: true,
        });
        const shipCell = document.querySelector(
          '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
        );
        shipCell.dispatchEvent(mouseoutEvent);
        const previewCells = document.querySelectorAll(
          '.ship-preview, .invalid-placement',
        );
        expect(previewCells.length).toBe(0);
      });
    });

    describe('ship placement', () => {
      function setupShipPlacementTest(isVertical, isValid) {
        mockValidationCallback.mockReturnValue(isValid);
        display.setupShipPlacement(
          ships,
          mockPlacementCallback,
          mockValidationCallback,
        );

        if (isVertical) {
          const rotateButton = document.querySelector('.rotate');
          rotateButton.click();
        }

        const shipCell1 = document.querySelector(
          '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
        );
        shipCell1.click();
      }

      it('place a ship horizontally', () => {
        // Setup
        setupShipPlacementTest(false, true);
        const previewCells = document.querySelectorAll('.ship');
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          false,
        );
        // The placement callback should be called with the correct parameters
        expect(mockPlacementCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          false,
        );
        // Two cells must have the className associated with the placed ship
        expect(previewCells.length).toBe(2);
        // For a horizontal placement, the cell (0, 0) and (0, 1) must have the correct className
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
            )
            .classList.contains('ship'),
        ).toBe(true);
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="1"]',
            )
            .classList.contains('ship'),
        ).toBe(true);
      });
      it('place a ship vertically', () => {
        // Setup
        setupShipPlacementTest(true, true);
        const previewCells = document.querySelectorAll('.ship');
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          true,
        );
        // The placement callback should be called with the correct parameters
        expect(mockPlacementCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          true,
        );
        // Two cells must have the className associated with the placed ship
        expect(previewCells.length).toBe(2);
        // For a vertical placement, the cell (0, 0) and (1, 0) must have the correct className
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
            )
            .classList.contains('ship'),
        ).toBe(true);
        expect(
          document
            .querySelector(
              '.placement-grid .grid-cell[data-row="1"][data-col="0"]',
            )
            .classList.contains('ship'),
        ).toBe(true);
      });
      it('does not place a ship horizontally if place is not valid', () => {
        // Setup
        setupShipPlacementTest(false, false);
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          false,
        );
        // The placement callback should not have been called
        expect(mockPlacementCallback).not.toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          false,
        );
      });
      it('does not place a ship horizontally if place is not valid', () => {
        // Setup
        setupShipPlacementTest(true, false);
        // The validation callback should be called with the correct parameters
        expect(mockValidationCallback).toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          true,
        );
        // The placement callback should not have been called
        expect(mockPlacementCallback).not.toHaveBeenCalledWith(
          ships[0].size,
          0,
          0,
          true,
        );
      });
    });
    it('closes the dialog after placing all ships', () => {
      const shipPlacementDialog = document.querySelector('.ship-placement');
      mockValidationCallback.mockReturnValue(true);
      display.setupShipPlacement(
        ships,
        mockPlacementCallback,
        mockValidationCallback,
      );

      const shipCell = document.querySelector(
        '.placement-grid .grid-cell[data-row="0"][data-col="0"]',
      );
      shipCell.click();

      expect(shipPlacementDialog.close).toHaveBeenCalled();
    });
  });
});
// Test mouseout
