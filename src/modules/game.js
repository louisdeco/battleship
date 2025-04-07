import Player from './player.js';
import Display from './display.js';

function Game() {
  const player = Player();
  const computer = Player();
  const display = Display();

  const SHIPS = [
    { name: 'Carrier', size: 5 },
    { name: 'Battleship', size: 4 },
    { name: 'Cruiser', size: 3 },
    { name: 'Submarine', size: 3 },
    { name: 'Destroyer', size: 2 },
  ];

  let isPlayerTurn = true;
  let gameEnded = false;

  function initialize() {
    display.initialize();

    // Set up ship placement for player
    display.setupShipPlacement(SHIPS, placePlayerShip, validatePlacement);

    // Set up attack handlers
    display.setupAttackHandlers(handlePlayerAttack);

    // Set up play gain button
    display.setupPlayAgainButton(resetGame);

    // Place computer ship randomly
    placeComputerShipsRandomly();

    // Initial board update;
    updateBoards();
  }

  function validatePlacement(shipSize, y, x, isVertical) {
    return player.getGameBoard().enoughPlace(shipSize, y, x, isVertical);
  }

  function placePlayerShip(shipSize, y, x, isVertical) {
    try {
      player.getGameBoard().placeShip(shipSize, y, x, isVertical);
      updateBoards();
      return true;
    } catch (error) {
      console.error('Error placing ship: ', error);
      return false;
    }
  }

  function updateBoards() {
    const playerBoard = player.getGameBoard().getBoard();
    const computerBoard = computer.getGameBoard().getBoard();
    display.updateBoardDisplay(playerBoard, computerBoard);
  }

  function handlePlayerAttack(y, x) {
    if (!isPlayerTurn || gameEnded) return;

    try {
      // Player attack turn
      player.attack(computer, y, x);
      updateBoards();

      if (computer.getGameBoard().allShipSunk()) {
        gameEnded = true;
        display.showGameOver(true);
        return;
      }

      // Computer attack turn
      isPlayerTurn = false;
      setTimeout(handleComputerAttack, 200);
    } catch (error) {
      console.error('Error during computer attack: ', error);
    }
  }

  function handleComputerAttack() {
    if (gameEnded) return;

    try {
      computer.autoAttack(player);
      updateBoards();

      if (player.getGameBoard().allShipSunk()) {
        gameEnded = true;
        display.showGameOver(false);
        return;
      }

      isPlayerTurn = true;
    } catch (error) {
      console.error('Error during computer attack: ', error);
    }
  }

  function placeComputerShipsRandomly() {
    const computerBoard = computer.getGameBoard();

    SHIPS.forEach((ship) => {
      let placed = false;

      while (!placed) {
        const y = Math.floor(Math.random() * 10);
        const x = Math.floor(Math.random() * 10);
        const isVertical = Math.random() > 0.5;

        // Check if placement is valid before attempting to place
        if (computerBoard.enoughPlace(ship.size, y, x, isVertical)) {
          computerBoard.placeShip(ship.size, y, x, isVertical);
          placed = true;
        }
      }
    });
  }

  function resetGame() {
    // Reset game state
    isPlayerTurn = true;
    gameEnded = false;

    // Create new players
    const newPlayer = Player();
    const newComputer = Player();

    // Update the references
    Object.assign(player, newPlayer);
    Object.assign(computer, newComputer);

    // Reset display
    display.initialize();

    // Set up ship placement again
    display.setupShipPlacement(SHIPS, placePlayerShip, validatePlacement);

    // Place computer ships randomly
    placeComputerShipsRandomly();

    // Initial board update
    updateBoards();
  }

  return { initialize };
}

export default Game;
