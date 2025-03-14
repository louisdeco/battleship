import Ship from '../modules/ship';

describe('Ship', () => {
  describe('factory function', () => {
    it('throws an error when no length is provided', () => {
      expect(() => Ship()).toThrow('Ship length must be provided');
    });

    it('creates a ship with the specified length', () => {
      const ship = Ship(5);
      expect(ship.getLength()).toBe(5);
    });
  });

  describe('hit', () => {
    it('increase the number of hit in the ship', () => {
      const ship = Ship(3);
      expect(ship.hit()).toBe(1);
      expect(ship.hit()).toBe(2);
      expect(ship.hit()).toBe(3);
    });
  });

  describe('isSunk', () => {
    it('should return true when hits equal or exceed ship length', () => {
      const ship = Ship(3);
      expect(ship.isSunk()).toBe(false);
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(false);
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });
  });
});
