import { GameBoard } from '../modules/gameboard';

describe('GameBoard', () => {
  let gameBoard;

  beforeEach(() => {
    gameBoard = GameBoard();
  });

  describe('factory function', () => {
    it('creates a game board', () => {
      expect(gameBoard).toBeDefined();
      expect(typeof gameBoard).toBe('object');
    });
  });

  describe('getBoard', () => {
    it('returns a 10x10 grid initialized with null values', () => {
      const board = gameBoard.getBoard();
      expect(board.length).toBe(10);
      expect(board[0].length).toBe(10);

      board.forEach((array) => {
        array.forEach((cell) => {
          expect(cell).toStrictEqual({ content: null, hit: false });
        });
      });
    });
  });

  describe('placeShip', () => {
    let xPosition, yPosition;

    beforeEach(() => {
      xPosition = 0;
      yPosition = 0;
    });

    it('throws an error if the ship size is not between 1 and 5', () => {
      expect(() => gameBoard.placeShip(6, 0, 0)).toThrow(
        'Ship size must be between 1 and 5',
      );
      expect(() => gameBoard.placeShip(-1, 0, 0)).toThrow(
        'Ship size must be between 1 and 5',
      );
    });

    it('throws an error if the coordinates are out of bounds', () => {
      const xPositionOutOfBonds = 10;
      const shipSize = 2;
      expect(() =>
        gameBoard.placeShip(shipSize, yPosition, xPositionOutOfBonds),
      ).toThrow('Coordinates must be valid');
    });

    it('throws an error if there is not enough place on the board', () => {
      const xPositionEndOfBoard = 9;
      const shipSize = 2;
      expect(() =>
        gameBoard.placeShip(shipSize, yPosition, xPositionEndOfBoard),
      ).toThrow('There must be enough place available for the ship');
    });

    it('place a ship horizontally on the grid', () => {
      const shipSize = 2;
      gameBoard.placeShip(shipSize, yPosition, xPosition);
      const board = gameBoard.getBoard();

      for (let i = xPosition; i < xPosition + shipSize; i++) {
        expect(board[yPosition][i].content).toBe(0);
      }
    });

    it('place a ship vertically on the grid', () => {
      const shipSize = 2;
      gameBoard.placeShip(shipSize, yPosition, xPosition, true);
      const board = gameBoard.getBoard();

      for (let i = yPosition; i < yPosition + shipSize; i++) {
        expect(board[i][xPosition].content).toBe(0);
      }
    });

    it('throws an error if when trying to place a ship over an existing ship', () => {
      const shipSize = 4;
      gameBoard.placeShip(shipSize, yPosition, xPosition);
      expect(() => gameBoard.placeShip(shipSize, yPosition, xPosition)).toThrow(
        'There must be enough place available for the ship',
      );
    });
  });

  describe('receiveAttack', () => {
    beforeEach(() => {
      const yPosition = 1;
      const xPosition = 1;
      const shipSize = 2;
      gameBoard.placeShip(shipSize, yPosition, xPosition);
    });

    it('throw an error if the coordinates are out of bounds', () => {
      expect(() => gameBoard.receiveAttack(10, 0)).toThrow(
        'Coordinates must be valid',
      );
    });

    it('increase the hit counter of a boat', () => {
      gameBoard.receiveAttack(1, 1);
      const ships = gameBoard.getShips();
      expect(ships[0].getHit()).toBe(1);
      expect(gameBoard.getBoard()[1][1].hit).toBe(true);
    });

    it('throws an error if the position is already attacked', () => {
      gameBoard.receiveAttack(1, 1);
      expect(() => gameBoard.receiveAttack(1, 1)).toThrow(
        'Position already attacked!',
      );
    });
  });

  describe('allShipSunk', () => {
    beforeEach(() => {
      const yPosition = 0;
      const xPosition = 0;
      const shipSize = 2;
      gameBoard.placeShip(shipSize, yPosition, xPosition);
      gameBoard.receiveAttack(yPosition, xPosition);
    });

    it('return false when not all ship are sunk', () => {
      expect(gameBoard.allShipSunk()).toBe(false);
    });

    it('return true when all ship are sunk', () => {
      gameBoard.receiveAttack(0, 1);
      expect(gameBoard.allShipSunk()).toBe(true);
    });
  });
});
