import GameBoard from './gameboard';

function Player() {
  const _gameBoard = GameBoard();
  const _state = {
    behavior: 'search',
    shipsHit: [],
    hits: {},
    potentialHits: [],
    direction: null,
  };

  const getGameBoard = () => _gameBoard;

  const attack = (opponent, y, x) =>
    opponent.getGameBoard().receiveAttack(y, x);

  function autoAttack(opponent) {
    if (_state.behavior === 'search') search(opponent);
    if (_state.behavior === 'target') target(opponent);
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
      if (!_state.shipsHit.includes(shipId)) _state.shipsHit.push(shipId);
      if (!_state.hits[shipId]) _state.hits[shipId] = [];
      _state.hits[shipId].push([y, x]);
      const ship = opponentGameBoard.getShips()[shipId];
      if (ship.isSunk()) {
        _state.shipsHit.shift();
        if (_state.shipsHit.length === 0) _state.behavior = 'search';
      }
    }
  }

  function search(opponent) {
    const { opponentBoard } = getOpponentGameData(opponent);
    const availablePosition = opponentBoard.flatMap((row, y) =>
      row.map((cell, x) => (!cell.hit ? [y, x] : null)).filter(Boolean),
    );
    const randomIndex = Math.floor(Math.random() * availablePosition.length);
    const [y, x] = availablePosition[randomIndex];

    const isHit = attack(opponent, y, x);
    handleHit(isHit, y, x, opponent);
  }

  function getPotentialHits(shipToFocus, opponent) {
    const { opponentBoard } = getOpponentGameData(opponent);
    const [yLastHit, xLastHit] =
      _state.hits[shipToFocus][_state.hits[shipToFocus].length - 1];
    const adjacentPositions = [
      [yLastHit - 1, xLastHit],
      [yLastHit + 1, xLastHit],
      [yLastHit, xLastHit - 1],
      [yLastHit, xLastHit + 1],
    ];

    _state.potentialHits = adjacentPositions.filter(([y, x]) => {
      if (!(y >= 0 && y < 10 && x >= 0 && x < 10)) return false;
      return !opponentBoard[y][x].hit;
    });
  }

  function target(opponent) {
    const shipToFocus = _state.shipsHit[0];

    if (_state.potentialHits.length === 0)
      getPotentialHits(shipToFocus, opponent);

    if (_state.potentialHits.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * _state.potentialHits.length,
      );
      const [y, x] = _state.potentialHits[randomIndex];

      const isHit = attack(opponent, y, x);
      handleHit(isHit, y, x, opponent);
    }

    if (_state.hits[shipToFocus].length > 2) _state.behavior = 'destroy';
  }

  return { getGameBoard, attack, autoAttack };
}

export default Player;
