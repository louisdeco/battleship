import GameBoard from './gameboard';

const AXIS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

const ORIENTATION = {
  UP: 'up',
  DOWN: 'down',
  RIGHT: 'right',
  LEFT: 'left',
};

const BEHAVIOR = {
  SEARCH: 'search',
  TARGET: 'target',
  DESTROY: 'destroy',
};

const BOARD_SIZE = 10;

function Player() {
  const _gameBoard = GameBoard();
  const _state = {
    behavior: BEHAVIOR.SEARCH,
    shipsHit: [],
    hits: {},
    potentialHits: [],
    axis: null,
    focus: null,
    orientation: null,
  };

  const getGameBoard = () => _gameBoard;

  const attack = (opponent, y, x) =>
    opponent.getGameBoard().receiveAttack(y, x);

  function autoAttack(opponent) {
    getPotentialHits(opponent);
    // Select a random position from all the available positions
    const randomIndex = Math.floor(Math.random() * _state.potentialHits.length);
    const [y, x] = _state.potentialHits[randomIndex];
    // Take a shot
    const isHit = attack(opponent, y, x);
    handleHit(isHit, y, x, opponent);
  }

  function getOpponentGameData(opponent) {
    const opponentGameBoard = opponent.getGameBoard();
    const opponentBoard = opponentGameBoard.getBoard();

    return { opponentGameBoard, opponentBoard };
  }

  function handleHit(isHit, y, x, opponent) {
    if (isHit) {
      const { opponentGameBoard, opponentBoard } =
        getOpponentGameData(opponent);
      const shipId = opponentBoard[y][x].content;

      trackHit(shipId, y, x);

      _state.focus = _state.shipsHit[0];

      const ship = opponentGameBoard.getShips()[shipId];

      updateBehavior(ship.isSunk(), shipId);
    }
    // If we miss and have already find the axis of a ship, we can deduce the direction we need to take
    else if (
      _state.behavior === BEHAVIOR.DESTROY &&
      _state.orientation === null &&
      _state.hits[_state.focus].length > 2
    )
      getOrientation([y, x]);
    _state.potentialHits = [];
  }

  function trackHit(shipId, y, x) {
    if (!_state.shipsHit.includes(shipId)) _state.shipsHit.push(shipId);
    if (!_state.hits[shipId]) _state.hits[shipId] = [];
    _state.hits[shipId].push([y, x]);
    orderHits(_state.hits[shipId]);
  }

  function updateBehavior(isSunk) {
    if (isSunk) {
      _state.shipsHit.shift();
      if (_state.shipsHit.length === 0) resetState();
      else _state.behavior = BEHAVIOR.TARGET;
    } else _state.behavior = BEHAVIOR.TARGET;
    if (_state.focus && _state.hits[_state.focus].length >= 2) {
      _state.behavior = BEHAVIOR.DESTROY;
      getAxis(_state.hits[_state.focus]);
    }
  }

  function getPotentialHits(opponent) {
    const { opponentBoard } = getOpponentGameData(opponent);
    const potentialHits = [];
    if (_state.behavior === BEHAVIOR.SEARCH) {
      _state.potentialHits = opponentBoard.flatMap((row, y) =>
        row.map((cell, x) => (!cell.hit ? [y, x] : null)).filter(Boolean),
      );
      return;
    }
    const [yFirstHit, xFirstHit] = _state.hits[_state.focus][0];
    const [yLastHit, xLastHit] =
      _state.hits[_state.focus][_state.hits[_state.focus].length - 1];
    if (_state.behavior === BEHAVIOR.TARGET) {
      // After one hit, potential hits are the four cells surrounding the hit
      potentialHits.push(
        [yFirstHit - 1, xFirstHit],
        [yFirstHit + 1, xFirstHit],
        [yFirstHit, xFirstHit - 1],
        [yFirstHit, xFirstHit + 1],
      );
    } else if (
      _state.behavior === BEHAVIOR.DESTROY &&
      _state.orientation === null
    ) {
      // After two hits, potential hits are the two cells before and after the hit on the same axis
      if (_state.axis === AXIS.HORIZONTAL)
        potentialHits.push(
          [yFirstHit, xFirstHit - 1],
          [yLastHit, xLastHit + 1],
        );
      if (_state.axis === AXIS.VERTICAL)
        potentialHits.push(
          [yFirstHit - 1, xFirstHit],
          [yLastHit + 1, xLastHit],
        );
    } else if (
      _state.behavior === BEHAVIOR.DESTROY &&
      _state.orientation !== null
    ) {
      // After two hits and a miss, the potential hit is the one at the end of the axis at the opposite direction of the missed shot
      if (_state.orientation === ORIENTATION.DOWN)
        potentialHits.push([yLastHit + 1, xFirstHit]);
      if (_state.orientation === ORIENTATION.UP)
        potentialHits.push([yFirstHit - 1, xFirstHit]);
      if (_state.orientation === ORIENTATION.LEFT)
        potentialHits.push([yFirstHit, xFirstHit - 1]);
      if (_state.orientation === ORIENTATION.RIGHT)
        potentialHits.push([yFirstHit, xLastHit + 1]);
    }
    // We filter out impossible coordinates or cells that has already been hit
    _state.potentialHits = potentialHits.filter(([y, x]) => {
      if (!(y >= 0 && y < BOARD_SIZE && x >= 0 && x < BOARD_SIZE)) return false;
      return !opponentBoard[y][x].hit;
    });
  }

  function getAxis(arrayHits) {
    const [y1, x1] = arrayHits[0];
    const [y2, x2] = arrayHits[arrayHits.length - 1];

    if (y1 === y2 && (x1 === x2 - 1 || x1 === x2 + 1))
      _state.axis = AXIS.HORIZONTAL;
    if (x1 === x2 && (y1 === y2 - 1 || y1 === y2 + 1))
      _state.axis = AXIS.VERTICAL;
  }

  function orderHits(arrayHits) {
    const isHorizontal = arrayHits.every(([y]) => y === arrayHits[0][0]);
    if (isHorizontal)
      arrayHits.sort(
        (coordinate1, coordinate2) => coordinate1[1] - coordinate2[1],
      );
    else
      arrayHits.sort(
        (coordinate1, coordinate2) => coordinate1[0] - coordinate2[0],
      );
  }

  function getOrientation(missedHit) {
    const [yMissed, xMissed] = missedHit;
    const [yFirstHit, xFirstHit] = _state.hits[_state.focus][0];
    const [yLastHit, xLastHit] =
      _state.hits[_state.focus][_state.hits[_state.focus].length - 1];
    if (_state.axis === AXIS.VERTICAL) {
      if (yMissed > yLastHit) _state.orientation = ORIENTATION.UP;
      if (yMissed < yFirstHit) _state.orientation = ORIENTATION.DOWN;
    }
    if (_state.axis === AXIS.HORIZONTAL) {
      if (xMissed > xLastHit) _state.orientation = ORIENTATION.LEFT;
      if (xMissed < xFirstHit) _state.orientation = ORIENTATION.RIGHT;
    }
  }

  function resetState() {
    _state.behavior = BEHAVIOR.SEARCH;
    _state.axis = null;
    _state.orientation = null;
    _state.focus = null;
    _state.potentialHits = [];
  }

  return { getGameBoard, attack, autoAttack };
}

export default Player;
