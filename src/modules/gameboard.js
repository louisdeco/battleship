import Ship from './ship';

function GameBoard() {
  const _board = Array.from(Array(10), () =>
    Array(10)
      .fill()
      .map(() => ({ content: null, hit: false })),
  );
  const _ships = {};
  let _counter = 0;

  const getBoard = () => _board;

  const getShips = () => _ships;

  const validateCoordinate = (y, x) => y >= 0 && y <= 9 && x >= 0 && x <= 9;

  function enoughPlace(shipSize, y, x, isVertical = false) {
    if (isVertical) {
      // Check if all potential ship positions are valid
      if (y + shipSize - 1 > 9) return false;
      // Check if all vertical positions are empty
      for (let i = y; i < y + shipSize; i++) {
        if (!validateCoordinate(i, x) || _board[i][x].content !== null)
          return false;
      }
      return true;
    }
    // Check if all potential ship positions are valid
    if (x + shipSize - 1 > 9) return false;
    // Check if all horizontal positions are empty
    for (let i = x; i < x + shipSize; i++) {
      if (!validateCoordinate(y, i) || _board[y][i].content != null)
        return false;
    }
    return true;
  }

  function placeShip(shipSize, y, x, isVertical = false) {
    if (shipSize < 1 || shipSize > 5)
      throw new Error('Ship size must be between 1 and 5');
    if (!validateCoordinate(y, x)) throw new Error('Coordinates must be valid');
    if (!enoughPlace(shipSize, y, x, isVertical))
      throw new Error('There must be enough place available for the ship');

    const newShip = Ship(shipSize);
    const shipId = _counter;
    _ships[shipId] = newShip;
    _counter += 1;

    if (isVertical) {
      for (let i = y; i < y + shipSize; i++) {
        _board[i][x].content = shipId;
      }
      return;
    }
    for (let i = x; i < x + shipSize; i++) {
      _board[y][i].content = shipId;
    }
  }

  function receiveAttack(y, x) {
    if (!validateCoordinate(y, x)) throw new Error('Coordinates must be valid');
    if (_board[y][x].hit === true)
      throw new Error('Position already attacked!');

    _board[y][x].hit = true;

    if (typeof _board[y][x].content === 'number') {
      _ships[_board[y][x].content].hit();
      return true;
    }
    return false;
  }

  function allShipSunk() {
    return Object.values(_ships).every((ship) => ship.isSunk());
  }

  return { getBoard, placeShip, getShips, receiveAttack, allShipSunk };
}

export default GameBoard;
