import GameBoard from "../modules/gameboard";

describe("GameBoard", () => {
  let gameBoard;

  beforeEach(() => {
    gameBoard = GameBoard();
  });

  describe("factory function", () => {
    it("creates a game board", () => {
      expect(gameBoard).toBeDefined();
      expect(typeof gameBoard).toBe("object");
    });
  });

  describe("getBoard", () => {
    it("returns a 10x10 grid initialized with null values", () => {
      const board = gameBoard.getBoard();
      expect(board.length).toBe(10);
      expect(board[0].length).toBe(10);

      board.forEach((array) => {
        array.forEach((cell) => {
          expect(cell).toBeNull();
        });
      });
    });
  });

  describe("placeShip", () => {
    it("throws an error if the coordinates are out of bounds", () => {
      const xPosition = 10;
      const yPosition = 0;
      const shipSize = 2;
      expect(() => gameBoard.placeShip(shipSize, yPosition, xPosition)).toThrow(
        "Coordinates must be valid",
      );
    });

    it("throws an error if there is not enough place on the board", () => {
      const xPosition = 9;
      const yPosition = 0;
      const shipSize = 2;
      expect(() => gameBoard.placeShip(shipSize, yPosition, xPosition)).toThrow(
        "There must be enough place available for the ship",
      );
    });

    it("place a ship horizontally on the grid", () => {
      const xPosition = 0;
      const yPosition = 0;
      const shipSize = 2;
      gameBoard.placeShip(shipSize, yPosition, xPosition);
      const board = gameBoard.getBoard();

      for (let i = xPosition; i < xPosition + shipSize; i++) {
        expect(board[yPosition][i]).toBe(0);
      }
    });

    it("place a ship vertically on the grid", () => {
      const xPosition = 0;
      const yPosition = 0;
      const shipSize = 2;
      gameBoard.placeShip(shipSize, yPosition, xPosition, true);
      const board = gameBoard.getBoard();

      for (let i = yPosition; i < yPosition + shipSize; i++) {
        expect(board[i][xPosition]).toBe(0);
      }
    });

    it("throws an error if when trying to place a ship over an existing ship", () => {
      const xPosition = 0;
      const yPosition = 0;
      const shipSize = 4;
      gameBoard.placeShip(shipSize, yPosition, xPosition);
      expect(() => gameBoard.placeShip(shipSize, yPosition, xPosition)).toThrow(
        "There must be enough place available for the ship",
      );
    });
  });
});
