import Player from '../modules/player';

// Mock the GameBoard module
jest.mock('../modules/gameboard', () => {
  // We mock a factory function so we should return one
  return jest.fn().mockImplementation(() => {
    return {
      getBoard: jest.fn(),
      placeShip: jest.fn(),
      getShips: jest.fn(),
      receiveAttack: jest.fn(),
      allShipSunk: jest.fn(),
    };
  });
});

// Helper functions
function createMockBoard() {
  return Array.from(Array(10), () =>
    Array(10)
      .fill()
      .map(() => ({ content: null, hit: false })),
  );
}

function placeShip(mockBoard, size, y, x, isVertical = false, shipId = 1) {
  if (isVertical) {
    for (let i = 0; i < size; i++) {
      mockBoard[y + i][x].content = shipId;
    }
  } else {
    for (let i = 0; i < size; i++) {
      mockBoard[y][x + i].content = shipId;
    }
  }
}

function setAllCellsHit(board, value) {
  board.forEach((row) => {
    row.forEach((cell) => {
      cell.hit = value;
    });
  });
}

function setupShipMock(player2, isSunk = false) {
  const isSunkMock = jest.fn().mockReturnValue(isSunk);
  player2.getGameBoard().getShips.mockReturnValue({
    1: { isSunk: isSunkMock },
  });
}

function setupReceiveAttackMock(player2, mockBoard) {
  player2.getGameBoard().receiveAttack.mockImplementation((y, x) => {
    mockBoard[y][x].hit = true;
    return mockBoard[y][x].content !== null;
  });
}

describe('Player', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('factory function', () => {
    it('creates a player', () => {
      const player = Player();
      expect(player).toBeDefined();
      expect(typeof player).toBe('object');
    });
  });

  describe('attack', () => {
    it('send an attack to a player game board', () => {
      const player = Player();
      const player2 = Player();
      player.attack(player2, 3, 4);
      expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(3, 4);
      expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledTimes(1);
    });
  });

  describe('autoAttack', () => {
    describe('search, target, and destroy behaviors as a sequence', () => {
      let mockBoard, player, player2;

      beforeAll(() => {
        // One-time setup for the entire sequence
        player = Player();
        player2 = Player();
        mockBoard = createMockBoard();
        // Place a horizontal ship
        placeShip(mockBoard, 5, 5, 3);
        player2.getGameBoard().getBoard.mockReturnValue(mockBoard);
        setupReceiveAttackMock(player2, mockBoard);
        setupShipMock(player2);
      });

      it('should enter search mode and hit a random position', () => {
        // Make a single shot possible at (5, 6)
        setAllCellsHit(mockBoard, true);
        mockBoard[5][6].hit = false;

        player.autoAttack(player2);
        expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(5, 6);
      });

      it('should enter target mode and hit an adjacent cell', () => {
        // Now we set all the cell hit to false except the adjacent cell (4, 6), (5, 6), (6, 6) and (5, 5)
        setAllCellsHit(mockBoard, false);
        // Maintain the hit from the previous test
        mockBoard[5][6].hit = true;

        // Make only one adjacent spot available (5, 7)
        mockBoard[4][6].hit = true;
        mockBoard[5][5].hit = true;
        mockBoard[6][6].hit = true;

        player.autoAttack(player2);
        expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(5, 7);
      });

      it('should enter destroy mode, figure out the axis and hit an axis cell', () => {
        // We remove the fake hit at (5, 5)
        mockBoard[5][5].hit = false;
        // We set one of the two axis potential hit to true to only let the potential position to be (5, 5)
        mockBoard[5][8].hit = true;

        player.autoAttack(player2);
        expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(5, 5);
      });

      describe('directional behavior', () => {
        let mockBoard, player, player2;

        beforeEach(() => {
          jest.clearAllMocks();
          mockBoard = createMockBoard();
          player = Player();
          player2 = Player();
          player2.getGameBoard().getBoard.mockReturnValue(mockBoard);
          setupReceiveAttackMock(player2, mockBoard);
          setupShipMock(player2, false);
        });

        it('tests horizontal-right direction', () => {
          // Place a size 5 ship horizontally from (0, 2) to (0, 6)
          placeShip(mockBoard, 5, 0, 2);
          // Set all cell already hit
          setAllCellsHit(mockBoard, true);
          // Make the cell available to hit the first two cells of the boat
          mockBoard[0][2].hit = false;
          mockBoard[0][3].hit = false;
          // We expect our first two attacks to hit the available cells
          player.autoAttack(player2);
          player.autoAttack(player2);
          // We force the player to miss the ship by constraining the available positions
          mockBoard[0][1].hit = false;
          player.autoAttack(player2);
          // We reset the board to only have the cells we hit as true
          setAllCellsHit(mockBoard, false);
          mockBoard[0][1].hit = true;
          mockBoard[0][2].hit = true;
          mockBoard[0][3].hit = true;
          // We expect our ship to go right now and hit (0, 4)
          player.autoAttack(player2);
          expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(
            0,
            4,
          );
        });

        it('tests horizontal-left direction', () => {
          // Place a size 5 ship horizontally from (0, 2) to (0, 6)
          placeShip(mockBoard, 5, 0, 2);
          // Set all cell already hit
          setAllCellsHit(mockBoard, true);
          // Make the cell available to hit the last two cells of the boat
          mockBoard[0][5].hit = false;
          mockBoard[0][6].hit = false;
          // We expect our first two attacks to hit the available cells
          player.autoAttack(player2);
          player.autoAttack(player2);
          // We force the player to miss the ship by constraining the available positions
          mockBoard[0][7].hit = false;
          player.autoAttack(player2);
          // We reset the board to only have the cells we hit as true
          setAllCellsHit(mockBoard, false);
          mockBoard[0][5].hit = true;
          mockBoard[0][6].hit = true;
          mockBoard[0][7].hit = true;
          // We expect our ship to go left now and hit (0, 4)
          player.autoAttack(player2);
          expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(
            0,
            4,
          );
        });

        it('tests vertical-down direction', () => {
          // Place a size 5 ship vertically from (3, 4) to (7, 4)
          placeShip(mockBoard, 5, 3, 4, true);
          // Set all cell already hit
          setAllCellsHit(mockBoard, true);
          // Make the cell available to hit the first two cells of the boat
          mockBoard[4][4].hit = false;
          mockBoard[3][4].hit = false;
          // We expect our first two attacks to hit the available cells
          player.autoAttack(player2);
          player.autoAttack(player2);
          // We force the player to miss the ship by constraining the available positions
          mockBoard[2][4].hit = false;
          player.autoAttack(player2);
          // We reset the board to only have the cells we hit as true
          setAllCellsHit(mockBoard, false);
          mockBoard[2][4].hit = true;
          mockBoard[3][4].hit = true;
          mockBoard[3][4].hit = true;
          // We expect our ship to go left now and hit (5, 4)
          player.autoAttack(player2);
          expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(
            5,
            4,
          );
        });

        it('tests vertical-up direction', () => {
          // Place a size 5 ship vertically from (3, 4) to (7, 4)
          placeShip(mockBoard, 5, 3, 4, true);
          // Set all cell already hit
          setAllCellsHit(mockBoard, true);
          // Make the cell available to hit the last two cells of the boat
          mockBoard[6][4].hit = false;
          mockBoard[7][4].hit = false;
          // We expect our first two attacks to hit the available cells
          player.autoAttack(player2);
          player.autoAttack(player2);
          // We force the player to miss the ship by constraining the available positions
          mockBoard[8][4].hit = false;
          player.autoAttack(player2);
          // We reset the board to only have the cells we hit as true
          setAllCellsHit(mockBoard, false);
          mockBoard[6][4].hit = true;
          mockBoard[7][4].hit = true;
          mockBoard[8][4].hit = true;
          // We expect our ship to go left now and hit (5, 4)
          player.autoAttack(player2);
          expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(
            5,
            4,
          );
        });
      });

      it('should go back to search behavior after sinking a ship', () => {
        // We expect our ship to continue left now and hit (0, 5) and sink the ship
        setupShipMock(player2, true);
        player.autoAttack(player2);
        expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(5, 4);
        // Reset the board and let the cell (9, 9) available
        setAllCellsHit(mockBoard, true);
        mockBoard[9][9].hit = false;
        // If it is searching, we should hit (9, 9)
        player.autoAttack(player2);
        expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(9, 9);
      });
    });
  });
});
