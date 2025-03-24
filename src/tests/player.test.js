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

describe('Player', () => {
  let player;
  let player2;

  beforeEach(() => {
    jest.clearAllMocks();
    player = Player();
    player2 = Player();
  });

  describe('factory function', () => {
    it('creates a player', () => {
      expect(player).toBeDefined();
      expect(typeof player).toBe('object');
    });
  });

  describe('attack', () => {
    it('send an attack to a player game board', () => {
      player.attack(player2, 3, 4);
      expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledWith(3, 4);
      expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledTimes(1);
    });
  });

  describe('autoAttack', () => {
    describe('search behavior', () => {
      it('should attack a valid position on opponent board', () => {
        // Mock a board where the only cell available to hit is (7, 3)
        const mockBoard = Array.from(Array(10), (_, y) =>
          Array(10)
            .fill()
            .map((_, x) => {
              const yTarget = 7;
              const xTarget = 3;
              return {
                content: null,
                hit: !(y === yTarget && x === xTarget),
              };
            }),
        );
        player2.getGameBoard().getBoard.mockReturnValue(mockBoard);

        player.autoAttack(player2);
        expect(player2.getGameBoard().receiveAttack).toHaveBeenCalledTimes(1);
        const args = player2.getGameBoard().receiveAttack.mock.calls[0];
        const [y, x] = args;
        expect(y).toBe(7);
        expect(x).toBe(3);
      });
    });

    describe('target behavior', () => {
      it('should target adjacent cells after hitting a ship', () => {
        const player2 = Player();
        // Mock a board with a 1x1 ship in the middle of the board (5, 5)
        const mockBoard = Array.from(Array(10), (_, y) =>
          Array(10)
            .fill()
            .map((_, x) => {
              const yTarget = 5;
              const xTarget = 5;
              return {
                content: x === xTarget && y === yTarget ? 1 : null,
                hit: !(x === xTarget && y === yTarget) ? true : false,
              };
            }),
        );
        player2.getGameBoard().getBoard.mockReturnValue(mockBoard);
        // Mock the ship
        player2.getGameBoard().getShips.mockReturnValue({
          1: { isSunk: jest.fn().mockReturnValue(false) },
        });
        // Mock receiveAttack to be change the board and hit true
        player2.getGameBoard().receiveAttack.mockImplementation((y, x) => {
          mockBoard[y][x].hit = true;
          return mockBoard[y][x].content != null;
        });
        // First attack should hit the ship and enter in the targeting mode
        player.autoAttack(player2);
        const args = player2.getGameBoard().receiveAttack.mock.calls[0];
        const [y, x] = args;
        expect(y).toBe(5);
        expect(x).toBe(5);
        // Now update the board to make the adjacent cells available for the next attack
        mockBoard[4][5].hit = false; // up
        mockBoard[6][5].hit = false; // down
        mockBoard[5][4].hit = false; // left
        mockBoard[5][6].hit = false; // right
        // Now second attack must target adjacent cells
        player.autoAttack(player2);
        const adjacentCells = [
          [4, 5],
          [6, 5],
          [5, 4],
          [5, 6],
        ];
        const secondArgs = player2.getGameBoard().receiveAttack.mock.calls[1];
        const [y2, x2] = secondArgs;
        expect(
          adjacentCells.some(([cy, cx]) => cy === y2 && cx === x2),
        ).toBeTruthy();
      });
    });
  });
});
