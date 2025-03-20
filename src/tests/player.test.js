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

  beforeEach(() => {
    jest.clearAllMocks();
    player = Player();
  });

  describe('factory function', () => {
    it('creates a player', () => {
      expect(player).toBeDefined();
      expect(typeof player).toBe('object');
    });
  });

  describe('attack', () => {
    it('send an attack to a player game board', () => {
      const player2 = Player();
      player.attack(player2, 3, 4);
      expect(player2.getBoard().receiveAttack).toHaveBeenCalledWith(3, 4);
      expect(player2.getBoard().receiveAttack).toHaveBeenCalledTimes(1);
    });
  });
});
