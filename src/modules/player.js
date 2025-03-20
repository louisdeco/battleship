import GameBoard from './gameboard';

function Player() {
  const _board = GameBoard();

  const getBoard = () => _board;

  const attack = (opponent, y, x) => opponent.getBoard().receiveAttack(y, x);

  return { getBoard, attack };
}

export default Player;
